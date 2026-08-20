#!/usr/bin/env python3
"""Dependency-light helpers for pinned-block MoonCat materialization verification."""

from __future__ import annotations

import base64
import hashlib
import json
import math
import re
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
POPULATION_COUNT = 25_440
CAT_ID = re.compile(r"^0x[0-9a-f]{10}$")
ADDRESS = re.compile(r"^0x[0-9a-fA-F]{40}$")
HASH32 = re.compile(r"^0x[0-9a-fA-F]{64}$")
ARRAY_TYPE = re.compile(r"^(.*)\[([0-9]*)\]$")
INTEGER_TYPE = re.compile(r"^(u?int)([0-9]*)$")
FIXED_BYTES_TYPE = re.compile(r"^bytes([0-9]+)$")
HEX_COLOR = re.compile(r"^#[0-9a-fA-F]{6}$")
RGB_COLOR = re.compile(r"^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$", re.IGNORECASE)
SVG_NUMBER = r"[-+]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][-+]?[0-9]+)?"
TRANSFORM_FUNCTION = re.compile(r"([A-Za-z]+)\s*\(([^)]*)\)")


class MaterializationError(ValueError):
    """Fatal local input, ABI, RPC, or materialization error."""


ROUND_CONSTANTS = [
    0x0000000000000001, 0x0000000000008082, 0x800000000000808A,
    0x8000000080008000, 0x000000000000808B, 0x0000000080000001,
    0x8000000080008081, 0x8000000000008009, 0x000000000000008A,
    0x0000000000000088, 0x0000000080008009, 0x000000008000000A,
    0x000000008000808B, 0x800000000000008B, 0x8000000000008089,
    0x8000000000008003, 0x8000000000008002, 0x8000000000000080,
    0x000000000000800A, 0x800000008000000A, 0x8000000080008081,
    0x8000000000008080, 0x0000000080000001, 0x8000000080008008,
]
ROTATIONS = [
    [0, 36, 3, 41, 18],
    [1, 44, 10, 45, 2],
    [62, 6, 43, 15, 61],
    [28, 55, 25, 21, 56],
    [27, 20, 39, 8, 14],
]
MASK64 = (1 << 64) - 1


def _rotate_left(value: int, amount: int) -> int:
    if amount == 0:
        return value
    return ((value << amount) | (value >> (64 - amount))) & MASK64


def keccak_f1600(state: list[int]) -> None:
    for constant in ROUND_CONSTANTS:
        columns = [state[x] ^ state[x + 5] ^ state[x + 10] ^ state[x + 15] ^ state[x + 20] for x in range(5)]
        delta = [columns[(x - 1) % 5] ^ _rotate_left(columns[(x + 1) % 5], 1) for x in range(5)]
        for x in range(5):
            for y in range(5):
                state[x + 5 * y] ^= delta[x]
        rotated = [0] * 25
        for x in range(5):
            for y in range(5):
                rotated[y + 5 * ((2 * x + 3 * y) % 5)] = _rotate_left(state[x + 5 * y], ROTATIONS[x][y])
        for x in range(5):
            for y in range(5):
                state[x + 5 * y] = rotated[x + 5 * y] ^ ((~rotated[(x + 1) % 5 + 5 * y]) & rotated[(x + 2) % 5 + 5 * y])
        state[0] ^= constant


def keccak256(data: bytes) -> bytes:
    rate = 136
    padded = bytearray(data)
    padded.append(0x01)
    while len(padded) % rate != rate - 1:
        padded.append(0)
    padded.append(0x80)
    state = [0] * 25
    for offset in range(0, len(padded), rate):
        block = padded[offset:offset + rate]
        for index, value in enumerate(block):
            state[index // 8] ^= value << (8 * (index % 8))
        keccak_f1600(state)
    output = bytearray()
    while len(output) < 32:
        for index in range(rate):
            output.append((state[index // 8] >> (8 * (index % 8))) & 0xFF)
            if len(output) == 32:
                return bytes(output)
        keccak_f1600(state)
    return bytes(output)


def json_bytes(value: Any) -> bytes:
    return (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def file_record(path: Path, role: str) -> dict[str, Any]:
    content = path.read_bytes()
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "sha256": sha256_bytes(content),
        "bytes": len(content),
        "role": role,
    }


def atomic_write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_bytes(json_bytes(value))
    temporary.replace(path)


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise MaterializationError(f"cannot read JSON {path.relative_to(ROOT)}") from exc


def canonical_type(parameter: dict[str, Any]) -> str:
    type_name = parameter.get("type")
    if not isinstance(type_name, str):
        raise MaterializationError("ABI parameter is missing type")
    if type_name.startswith("tuple"):
        suffix = type_name[5:]
        components = parameter.get("components")
        if not isinstance(components, list):
            raise MaterializationError("tuple ABI parameter is missing components")
        return "(" + ",".join(canonical_type(item) for item in components) + ")" + suffix
    return type_name


def canonical_signature(item: dict[str, Any]) -> str:
    if item.get("type") != "function" or not isinstance(item.get("name"), str):
        raise MaterializationError("ABI item is not a named function")
    return item["name"] + "(" + ",".join(canonical_type(value) for value in item.get("inputs", [])) + ")"


def function_by_signature(abi_document: dict[str, Any], signature: str) -> dict[str, Any]:
    matches = [
        item for item in abi_document.get("abi", [])
        if isinstance(item, dict) and item.get("type") == "function" and canonical_signature(item) == signature
    ]
    if len(matches) != 1:
        raise MaterializationError(f"ABI signature must resolve exactly once: {signature}")
    return matches[0]


def _array_parts(parameter: dict[str, Any]) -> tuple[dict[str, Any], int | None] | None:
    type_name = parameter["type"]
    match = ARRAY_TYPE.fullmatch(type_name)
    if not match:
        return None
    child = dict(parameter)
    child["type"] = match.group(1)
    return child, (None if match.group(2) == "" else int(match.group(2)))


def is_dynamic(parameter: dict[str, Any]) -> bool:
    type_name = parameter["type"]
    if type_name in {"string", "bytes"}:
        return True
    array = _array_parts(parameter)
    if array:
        child, length = array
        return length is None or is_dynamic(child)
    if type_name == "tuple":
        return any(is_dynamic(item) for item in parameter.get("components", []))
    return False


def static_size(parameter: dict[str, Any]) -> int:
    if is_dynamic(parameter):
        raise MaterializationError(f"dynamic ABI type has no static size: {canonical_type(parameter)}")
    array = _array_parts(parameter)
    if array:
        child, length = array
        assert length is not None
        return length * static_size(child)
    if parameter["type"] == "tuple":
        return sum(static_size(item) for item in parameter.get("components", []))
    return 32


def _word(value: int) -> bytes:
    if value < 0 or value >= 1 << 256:
        raise MaterializationError("ABI integer is outside uint256")
    return value.to_bytes(32, "big")


def encode_static(parameter: dict[str, Any], value: Any) -> bytes:
    type_name = parameter["type"]
    array = _array_parts(parameter)
    if array:
        child, length = array
        if length is None or not isinstance(value, (list, tuple)) or len(value) != length:
            raise MaterializationError(f"invalid fixed-array value for {canonical_type(parameter)}")
        return b"".join(encode_static(child, item) for item in value)
    if type_name == "tuple":
        components = parameter.get("components", [])
        values = list(value.values()) if isinstance(value, dict) else value
        if not isinstance(values, (list, tuple)) or len(values) != len(components):
            raise MaterializationError("tuple ABI value has wrong shape")
        return b"".join(encode_static(component, item) for component, item in zip(components, values))
    integer = INTEGER_TYPE.fullmatch(type_name)
    if integer:
        if not isinstance(value, int):
            raise MaterializationError(f"integer required for {type_name}")
        bits = int(integer.group(2) or "256")
        if integer.group(1) == "uint":
            if value < 0 or value >= 1 << bits:
                raise MaterializationError(f"value outside {type_name}")
            return _word(value)
        minimum, maximum = -(1 << (bits - 1)), (1 << (bits - 1)) - 1
        if not minimum <= value <= maximum:
            raise MaterializationError(f"value outside {type_name}")
        return (value % (1 << 256)).to_bytes(32, "big")
    if type_name == "bool":
        if not isinstance(value, bool):
            raise MaterializationError("bool ABI value required")
        return _word(int(value))
    if type_name == "address":
        if not isinstance(value, str) or not ADDRESS.fullmatch(value):
            raise MaterializationError("20-byte Ethereum address required")
        return bytes.fromhex(value[2:]).rjust(32, b"\0")
    fixed_bytes = FIXED_BYTES_TYPE.fullmatch(type_name)
    if fixed_bytes:
        length = int(fixed_bytes.group(1))
        if isinstance(value, str) and value.startswith("0x"):
            value = bytes.fromhex(value[2:])
        if not isinstance(value, bytes) or len(value) != length:
            raise MaterializationError(f"exactly {length} bytes required for {type_name}")
        return value.ljust(32, b"\0")
    raise MaterializationError(f"unsupported static ABI input type: {canonical_type(parameter)}")


def encode_dynamic(parameter: dict[str, Any], value: Any) -> bytes:
    type_name = parameter["type"]
    if type_name == "string":
        if not isinstance(value, str):
            raise MaterializationError("string ABI value required")
        raw = value.encode("utf-8")
    elif type_name == "bytes":
        if isinstance(value, str) and value.startswith("0x"):
            value = bytes.fromhex(value[2:])
        if not isinstance(value, bytes):
            raise MaterializationError("bytes ABI value required")
        raw = value
    else:
        raise MaterializationError(f"unsupported dynamic ABI input type: {canonical_type(parameter)}")
    return _word(len(raw)) + raw + b"\0" * ((32 - len(raw) % 32) % 32)


def encode_arguments(parameters: list[dict[str, Any]], values: list[Any]) -> bytes:
    if len(parameters) != len(values):
        raise MaterializationError("ABI argument count mismatch")
    head_size = sum(32 if is_dynamic(parameter) else static_size(parameter) for parameter in parameters)
    head, tail = bytearray(), bytearray()
    for parameter, value in zip(parameters, values):
        if is_dynamic(parameter):
            head.extend(_word(head_size + len(tail)))
            tail.extend(encode_dynamic(parameter, value))
        else:
            head.extend(encode_static(parameter, value))
    return bytes(head + tail)


def encode_call(abi_document: dict[str, Any], signature: str, values: list[Any]) -> str:
    item = function_by_signature(abi_document, signature)
    selector = keccak256(signature.encode("ascii"))[:4]
    return "0x" + (selector + encode_arguments(item.get("inputs", []), values)).hex()


def _decode_word(data: bytes, offset: int) -> int:
    if offset < 0 or offset + 32 > len(data):
        raise MaterializationError("ABI output is truncated")
    return int.from_bytes(data[offset:offset + 32], "big")


def decode_static(parameter: dict[str, Any], data: bytes, offset: int) -> tuple[Any, int]:
    type_name = parameter["type"]
    array = _array_parts(parameter)
    if array:
        child, length = array
        if length is None:
            raise MaterializationError("dynamic array reached static decoder")
        values, cursor = [], offset
        for _ in range(length):
            decoded, consumed = decode_static(child, data, cursor)
            values.append(decoded)
            cursor += consumed
        return values, cursor - offset
    if type_name == "tuple":
        components = parameter.get("components", [])
        values, cursor = [], offset
        for component in components:
            decoded, consumed = decode_static(component, data, cursor)
            values.append(decoded)
            cursor += consumed
        if all(isinstance(component.get("name"), str) and component["name"] for component in components):
            return {component["name"]: value for component, value in zip(components, values)}, cursor - offset
        return values, cursor - offset
    integer = INTEGER_TYPE.fullmatch(type_name)
    if integer:
        value = _decode_word(data, offset)
        bits = int(integer.group(2) or "256")
        if bits < 256:
            value &= (1 << bits) - 1
        if integer.group(1) == "int" and value & (1 << (bits - 1)):
            value -= 1 << bits
        return value, 32
    if type_name == "bool":
        value = _decode_word(data, offset)
        if value not in {0, 1}:
            raise MaterializationError("invalid ABI bool output")
        return bool(value), 32
    if type_name == "address":
        raw = data[offset:offset + 32]
        if len(raw) != 32 or any(raw[:12]):
            raise MaterializationError("invalid ABI address output")
        return "0x" + raw[12:].hex(), 32
    fixed_bytes = FIXED_BYTES_TYPE.fullmatch(type_name)
    if fixed_bytes:
        length = int(fixed_bytes.group(1))
        raw = data[offset:offset + 32]
        if len(raw) != 32:
            raise MaterializationError("truncated fixed-bytes ABI output")
        return "0x" + raw[:length].hex(), 32
    raise MaterializationError(f"unsupported static ABI output type: {canonical_type(parameter)}")


def decode_dynamic(parameter: dict[str, Any], data: bytes, offset: int) -> Any:
    type_name = parameter["type"]
    if type_name in {"string", "bytes"}:
        length = _decode_word(data, offset)
        start, end = offset + 32, offset + 32 + length
        if end > len(data):
            raise MaterializationError("dynamic ABI output is truncated")
        raw = data[start:end]
        if type_name == "bytes":
            return "0x" + raw.hex()
        try:
            return raw.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise MaterializationError("ABI string output is not UTF-8") from exc
    raise MaterializationError(f"unsupported dynamic ABI output type: {canonical_type(parameter)}")


def decode_outputs(abi_document: dict[str, Any], signature: str, encoded: str) -> list[Any]:
    item = function_by_signature(abi_document, signature)
    if not isinstance(encoded, str) or not encoded.startswith("0x") or len(encoded) % 2:
        raise MaterializationError(f"invalid hex ABI output for {signature}")
    try:
        data = bytes.fromhex(encoded[2:])
    except ValueError as exc:
        raise MaterializationError(f"invalid hex ABI output for {signature}") from exc
    outputs = item.get("outputs", [])
    values, cursor = [], 0
    for parameter in outputs:
        if is_dynamic(parameter):
            relative = _decode_word(data, cursor)
            values.append(decode_dynamic(parameter, data, relative))
            cursor += 32
        else:
            value, consumed = decode_static(parameter, data, cursor)
            values.append(value)
            cursor += consumed
    return values


class JsonRpcClient:
    """Sequential JSON-RPC transport that never exposes its endpoint."""

    def __init__(self, endpoint: str, *, timeout: float = 30, retries: int = 4, backoff: float = 1.0):
        if not isinstance(endpoint, str) or not endpoint:
            raise MaterializationError("RPC endpoint is required through environment")
        self._endpoint = endpoint
        self.timeout = timeout
        self.retries = retries
        self.backoff = backoff
        self._next_id = 1

    def _request(self, payload: Any) -> Any:
        body = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        for attempt in range(self.retries + 1):
            try:
                request = urllib.request.Request(
                    self._endpoint,
                    data=body,
                    headers={"Content-Type": "application/json", "Accept": "application/json"},
                    method="POST",
                )
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    return json.loads(response.read().decode("utf-8"))
            except urllib.error.HTTPError as exc:
                retryable = exc.code in {408, 425, 429, 500, 502, 503, 504}
                if attempt >= self.retries or not retryable:
                    raise MaterializationError(f"RPC HTTP failure status={exc.code}") from None
            except (urllib.error.URLError, TimeoutError, OSError, ValueError, json.JSONDecodeError):
                if attempt >= self.retries:
                    raise MaterializationError("RPC transport or JSON response failure") from None
            time.sleep(self.backoff * (2 ** attempt))
        raise AssertionError("unreachable")

    def call(self, method: str, params: list[Any]) -> Any:
        request_id = self._next_id
        self._next_id += 1
        response = self._request({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params})
        if not isinstance(response, dict) or response.get("id") != request_id:
            raise MaterializationError(f"malformed RPC response for {method}")
        if "error" in response:
            error = response["error"] if isinstance(response["error"], dict) else {}
            raise MaterializationError(f"RPC {method} provider error code={error.get('code')}; message suppressed")
        if "result" not in response:
            raise MaterializationError(f"RPC response has no result for {method}")
        return response["result"]

    def batch(self, calls: list[tuple[str, list[Any]]]) -> list[Any]:
        if not calls:
            return []
        payload, order = [], []
        for method, params in calls:
            request_id = self._next_id
            self._next_id += 1
            order.append((request_id, method))
            payload.append({"jsonrpc": "2.0", "id": request_id, "method": method, "params": params})
        response = self._request(payload)
        if not isinstance(response, list):
            raise MaterializationError("RPC batch response is not an array")
        by_id = {item.get("id"): item for item in response if isinstance(item, dict)}
        results = []
        for request_id, method in order:
            item = by_id.get(request_id)
            if not isinstance(item, dict):
                raise MaterializationError(f"RPC batch omitted response for {method}")
            if "error" in item:
                error = item["error"] if isinstance(item["error"], dict) else {}
                raise MaterializationError(f"RPC {method} provider error code={error.get('code')}; message suppressed")
            if "result" not in item:
                raise MaterializationError(f"RPC batch response has no result for {method}")
            results.append(item["result"])
        return results


def contract_call(client: JsonRpcClient, address: str, abi: dict[str, Any], signature: str, values: list[Any], block_tag: str) -> list[Any]:
    encoded = encode_call(abi, signature, values)
    result = client.call("eth_call", [{"to": address, "data": encoded}, block_tag])
    return decode_outputs(abi, signature, result)


def _number(value: str | None, default: float = 0.0) -> float:
    if value is None or value == "":
        return default
    try:
        return float(value)
    except ValueError as exc:
        raise MaterializationError(f"invalid SVG numeric value: {value}") from exc


def _number_list(value: str) -> list[float]:
    tokens = re.findall(SVG_NUMBER, value)
    remainder = re.sub(SVG_NUMBER, "", value)
    if remainder.strip(" ,\t\r\n") or not tokens:
        raise MaterializationError("invalid SVG numeric list")
    numbers = [_number(token) for token in tokens]
    if any(not math.isfinite(number) for number in numbers):
        raise MaterializationError("non-finite SVG number")
    return numbers


def _matrix_multiply(
    left: tuple[float, float, float, float, float, float],
    right: tuple[float, float, float, float, float, float],
) -> tuple[float, float, float, float, float, float]:
    a1, b1, c1, d1, e1, f1 = left
    a2, b2, c2, d2, e2, f2 = right
    return (
        a1 * a2 + c1 * b2,
        b1 * a2 + d1 * b2,
        a1 * c2 + c1 * d2,
        b1 * c2 + d1 * d2,
        a1 * e2 + c1 * f2 + e1,
        b1 * e2 + d1 * f2 + f1,
    )


def _parse_transform(value: str | None) -> tuple[float, float, float, float, float, float]:
    identity = (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
    if value is None or not value.strip():
        return identity
    matrix = identity
    cursor = 0
    matches = list(TRANSFORM_FUNCTION.finditer(value))
    if not matches:
        raise MaterializationError("unsupported SVG transform syntax")
    for match in matches:
        if value[cursor:match.start()].strip(" ,\t\r\n"):
            raise MaterializationError("unsupported SVG transform syntax")
        name = match.group(1).casefold()
        values = _number_list(match.group(2))
        if name == "translate" and len(values) in {1, 2}:
            tx, ty = values[0], values[1] if len(values) == 2 else 0.0
            operation = (1.0, 0.0, 0.0, 1.0, tx, ty)
        elif name == "scale" and len(values) in {1, 2}:
            sx, sy = values[0], values[1] if len(values) == 2 else values[0]
            operation = (sx, 0.0, 0.0, sy, 0.0, 0.0)
        else:
            raise MaterializationError(f"unsupported SVG transform function: {name}")
        matrix = _matrix_multiply(matrix, operation)
        cursor = match.end()
    if value[cursor:].strip(" ,\t\r\n"):
        raise MaterializationError("unsupported SVG transform syntax")
    return matrix


def _transform_point(
    matrix: tuple[float, float, float, float, float, float],
    point: tuple[float, float],
) -> tuple[float, float]:
    a, b, c, d, e, f = matrix
    x, y = point
    return a * x + c * y + e, b * x + d * y + f


def _normalize_svg_color(value: str | None) -> tuple[str, str] | None:
    if not isinstance(value, str):
        return None
    if HEX_COLOR.fullmatch(value):
        return value.lower(), "hex"
    match = RGB_COLOR.fullmatch(value)
    if match:
        channels = [int(channel) for channel in match.groups()]
        if all(0 <= channel <= 255 for channel in channels):
            return "#" + bytes(channels).hex(), "rgb-integer"
    return None


def _point_in_polygon(point: tuple[float, float], polygon: list[tuple[float, float]]) -> bool:
    """Apply the SVG default nonzero winding rule at a point off all edges."""
    x, y = point
    winding = 0
    for first, second in zip(polygon, polygon[1:] + polygon[:1]):
        x1, y1 = first
        x2, y2 = second
        cross = (x2 - x1) * (y - y1) - (x - x1) * (y2 - y1)
        if y1 <= y < y2 and cross > 0:
            winding += 1
        elif y2 <= y < y1 and cross < 0:
            winding -= 1
    return winding != 0


def normalize_svg(svg: str) -> dict[str, Any]:
    """Normalize defensible MoonCat polygon/use geometry into final painted cells."""
    raw = svg.encode("utf-8")
    base = {
        "utf8Bytes": len(raw),
        "sha256": sha256_bytes(raw),
        "keccak256": keccak256(raw).hex(),
    }
    try:
        root = ET.fromstring(svg)
    except ET.ParseError as exc:
        return {**base, "status": "incomparable-invalid-xml", "reason": str(exc)[:160]}
    view_box = root.attrib.get("viewBox")
    if not isinstance(view_box, str):
        return {**base, "status": "incomparable-missing-viewbox"}
    try:
        view = [_number(item) for item in re.split(r"[ ,]+", view_box.strip())]
    except MaterializationError:
        return {**base, "status": "incomparable-invalid-viewbox"}
    if len(view) != 4 or view[2] <= 0 or view[3] <= 0:
        return {**base, "status": "incomparable-invalid-viewbox"}
    cell_width = cell_height = None
    for element in root.iter():
        tag = element.tag.rsplit("}", 1)[-1]
        if tag == "rect" and element.attrib.get("id") == "r":
            cell_width = _number(element.attrib.get("width"), 1)
            cell_height = _number(element.attrib.get("height"), 1)
            break
    if not cell_width or not cell_height or not math.isclose(cell_width, cell_height):
        return {**base, "status": "incomparable-missing-square-cell-definition", "viewBox": view}
    width_cells = view[2] / cell_width
    height_cells = view[3] / cell_height
    if not math.isclose(width_cells, round(width_cells)) or not math.isclose(height_cells, round(height_cells)):
        return {**base, "status": "incomparable-nonintegral-logical-dimensions", "viewBox": view, "cellSize": cell_width}
    logical_width, logical_height = round(width_cells), round(height_cells)
    painted: dict[tuple[int, int], str] = {}
    unsupported: set[str] = set()
    constructs: Counter[str] = Counter()
    color_syntaxes: set[str] = set()
    paint_writes = 0
    overdraw_writes = 0

    def aligned_index(value: float, origin: float, size: float) -> int | None:
        index = (value - origin) / size
        return round(index) if math.isclose(index, round(index), abs_tol=1e-9) else None

    def paint(coordinate: tuple[int, int], color: str) -> None:
        nonlocal paint_writes, overdraw_writes
        paint_writes += 1
        if coordinate in painted:
            overdraw_writes += 1
        painted[coordinate] = color

    def visit(
        element: ET.Element,
        inherited_fill: str | None,
        inside_defs: bool,
        parent_matrix: tuple[float, float, float, float, float, float],
    ) -> None:
        tag = element.tag.rsplit("}", 1)[-1]
        now_defs = inside_defs or tag == "defs"
        style = element.attrib.get("style", "")
        style_fill = None
        for declaration in style.split(";"):
            if ":" in declaration:
                property_name, property_value = declaration.split(":", 1)
                if property_name.strip().casefold() == "fill":
                    style_fill = property_value.strip()
        fill = element.attrib.get("fill", style_fill or inherited_fill)
        transform_text = element.attrib.get("transform")
        try:
            local_matrix = _parse_transform(transform_text)
        except MaterializationError:
            unsupported.add("unsupported-transform")
            return
        matrix = _matrix_multiply(parent_matrix, local_matrix)
        if transform_text and transform_text.strip():
            constructs["transform"] += 1
        if not now_defs and any(
            key in element.attrib
            for key in ("stroke", "stroke-width", "opacity", "fill-opacity", "clip-path", "mask", "filter")
        ):
            unsupported.add("unsupported-presentation-attribute")
        if tag == "use" and not now_defs:
            href = element.attrib.get("href") or element.attrib.get("{http://www.w3.org/1999/xlink}href")
            normalized_color = _normalize_svg_color(fill)
            if href != "#r":
                unsupported.add("non-cell-use")
            elif normalized_color is None:
                unsupported.add("missing-or-unsupported-fill")
            else:
                try:
                    x = _number(element.attrib.get("x"))
                    y = _number(element.attrib.get("y"))
                except MaterializationError:
                    unsupported.add("invalid-cell-coordinate")
                else:
                    corners = [
                        _transform_point(matrix, point)
                        for point in ((x, y), (x + cell_width, y), (x, y + cell_height), (x + cell_width, y + cell_height))
                    ]
                    xs, ys = [point[0] for point in corners], [point[1] for point in corners]
                    left, right, top, bottom = min(xs), max(xs), min(ys), max(ys)
                    x_index = aligned_index(left, view[0], cell_width)
                    y_index = aligned_index(top, view[1], cell_height)
                    if (
                        x_index is None or y_index is None
                        or not math.isclose(right - left, cell_width)
                        or not math.isclose(bottom - top, cell_height)
                        or not 0 <= x_index < logical_width
                        or not 0 <= y_index < logical_height
                    ):
                        unsupported.add("non-grid-cell-use")
                    else:
                        color, syntax = normalized_color
                        color_syntaxes.add(syntax)
                        constructs["use"] += 1
                        paint((x_index, y_index), color)
        elif tag == "polygon" and not now_defs:
            normalized_color = _normalize_svg_color(fill)
            if normalized_color is None:
                unsupported.add("missing-or-unsupported-fill")
            else:
                try:
                    numbers = _number_list(element.attrib.get("points", ""))
                except MaterializationError:
                    unsupported.add("invalid-polygon-points")
                else:
                    if len(numbers) < 6 or len(numbers) % 2:
                        unsupported.add("invalid-polygon-points")
                    else:
                        polygon = [
                            _transform_point(matrix, (numbers[index], numbers[index + 1]))
                            for index in range(0, len(numbers), 2)
                        ]
                        aligned = all(
                            aligned_index(x, view[0], cell_width) is not None
                            and aligned_index(y, view[1], cell_height) is not None
                            for x, y in polygon
                        )
                        orthogonal = all(
                            math.isclose(first[0], second[0]) or math.isclose(first[1], second[1])
                            for first, second in zip(polygon, polygon[1:] + polygon[:1])
                        )
                        if not aligned:
                            unsupported.add("non-grid-aligned-polygon")
                        elif not orthogonal:
                            unsupported.add("non-orthogonal-polygon")
                        else:
                            covered = []
                            for cell_x in range(logical_width):
                                for cell_y in range(logical_height):
                                    center = (
                                        view[0] + (cell_x + 0.5) * cell_width,
                                        view[1] + (cell_y + 0.5) * cell_height,
                                    )
                                    if _point_in_polygon(center, polygon):
                                        covered.append((cell_x, cell_y))
                            if not covered:
                                unsupported.add("empty-grid-polygon")
                            else:
                                color, syntax = normalized_color
                                color_syntaxes.add(syntax)
                                constructs["polygon"] += 1
                                for coordinate in covered:
                                    paint(coordinate, color)
        elif tag == "rect" and not now_defs:
            unsupported.add("rect")
        elif tag in {"path", "circle", "ellipse", "line", "polyline", "image"} and not now_defs:
            unsupported.add(tag)
        elif tag not in {"svg", "defs", "g", "rect"} and not now_defs:
            unsupported.add(f"element:{tag}")
        for child in element:
            visit(child, fill, now_defs, matrix)

    identity = (1.0, 0.0, 0.0, 1.0, 0.0, 0.0)
    visit(root, None, False, identity)
    if unsupported or not painted:
        return {
            **base,
            "status": "incomparable-unsupported-svg-geometry",
            "viewBox": view,
            "cellSize": cell_width,
            "cellCountObserved": len(painted),
            "constructCounts": dict(sorted(constructs.items())),
            "unsupported": sorted(unsupported or {"no-painted-cells"}),
        }
    view_coordinates = sorted(painted)
    view_xs, view_ys = [item[0] for item in view_coordinates], [item[1] for item in view_coordinates]
    view_bounds = {
        "minX": min(view_xs), "maxX": max(view_xs),
        "minY": min(view_ys), "maxY": max(view_ys),
    }
    origin_x, origin_y = view_bounds["minX"], view_bounds["minY"]
    cropped = {
        (x - origin_x, y - origin_y): color
        for (x, y), color in painted.items()
    }
    coordinates = sorted(cropped)
    partitions: dict[str, list[tuple[int, int]]] = {}
    for coordinate, color in cropped.items():
        partitions.setdefault(color, []).append(coordinate)
    coordinate_text = ";".join(f"{x},{y}" for x, y in coordinates)
    partition_hashes = sorted(
        sha256_bytes(";".join(f"{x},{y}" for x, y in sorted(values)).encode("ascii"))
        for values in partitions.values()
    )
    xs, ys = [item[0] for item in coordinates], [item[1] for item in coordinates]
    return {
        **base,
        "status": "cell-normalized",
        "viewBox": [int(value) if value.is_integer() else value for value in view],
        "cellSize": int(cell_width) if cell_width.is_integer() else cell_width,
        "viewBoxLogicalDimensions": [logical_width, logical_height],
        "viewBoxOccupiedBoundingBox": view_bounds,
        "transparentMargins": {
            "left": origin_x,
            "right": logical_width - 1 - view_bounds["maxX"],
            "top": origin_y,
            "bottom": logical_height - 1 - view_bounds["maxY"],
        },
        "normalizationOrigin": [origin_x, origin_y],
        "logicalDimensions": [
            view_bounds["maxX"] - origin_x + 1,
            view_bounds["maxY"] - origin_y + 1,
        ],
        "occupiedCellCount": len(coordinates),
        "occupiedCoordinateSha256": sha256_bytes(coordinate_text.encode("ascii")),
        "boundingBox": {"minX": min(xs), "maxX": max(xs), "minY": min(ys), "maxY": max(ys)},
        "distinctColorCount": len(partitions),
        "colorRoleCounts": sorted(len(values) for values in partitions.values()),
        "colorPartitionSha256": sha256_bytes(";".join(partition_hashes).encode("ascii")),
        "usedHexColors": sorted(partitions),
        "constructCounts": dict(sorted(constructs.items())),
        "colorSyntaxes": sorted(color_syntaxes),
        "paintWriteCount": paint_writes,
        "overdrawWriteCount": overdraw_writes,
    }


def decode_render_structure(row: dict[str, Any]) -> dict[str, Any]:
    width, height, palette = row["width"], row["height"], row["palette"]
    packed = base64.b64decode(row["pixels"], validate=True)
    indexes: list[int] = []
    for value in packed:
        indexes.extend((value >> 4, value & 0x0F))
    indexes = indexes[:width * height]
    coordinates, partitions = [], {}
    for x in range(width):
        for y in range(height):
            index = indexes[x * height + y]
            if index:
                coordinates.append((x, y))
                partitions.setdefault(palette[index].lower(), []).append((x, y))
    coordinate_text = ";".join(f"{x},{y}" for x, y in sorted(coordinates))
    partition_hashes = sorted(
        sha256_bytes(";".join(f"{x},{y}" for x, y in sorted(values)).encode("ascii"))
        for values in partitions.values()
    )
    xs, ys = [item[0] for item in coordinates], [item[1] for item in coordinates]
    return {
        "logicalDimensions": [width, height],
        "occupiedCellCount": len(coordinates),
        "occupiedCoordinateSha256": sha256_bytes(coordinate_text.encode("ascii")),
        "boundingBox": {"minX": min(xs), "maxX": max(xs), "minY": min(ys), "maxY": max(ys)},
        "distinctColorCount": len(partitions),
        "colorRoleCounts": sorted(len(values) for values in partitions.values()),
        "colorPartitionSha256": sha256_bytes(";".join(partition_hashes).encode("ascii")),
        "usedHexColors": sorted(partitions),
    }


def compare_structures(onchain: dict[str, Any], parser: dict[str, Any]) -> dict[str, Any]:
    if onchain.get("status") != "cell-normalized":
        return {"status": "incomparable", "reason": onchain.get("status")}
    dimensions = onchain["logicalDimensions"] == parser["logicalDimensions"]
    coordinates = onchain["occupiedCoordinateSha256"] == parser["occupiedCoordinateSha256"]
    role_counts = onchain["colorRoleCounts"] == parser["colorRoleCounts"]
    partitions = onchain["colorPartitionSha256"] == parser["colorPartitionSha256"]
    return {
        "status": "passed" if all((dimensions, coordinates, role_counts, partitions)) else "failed",
        "dimensionsEqual": dimensions,
        "occupiedCoordinatesEqual": coordinates,
        "colorRoleCountsEqual": role_counts,
        "colorPartitionsEqualIgnoringLiteralColors": partitions,
    }


def summarize_check_accounting(rows: list[dict[str, Any]]) -> dict[str, Any]:
    """Separate failed assertions from incomparable and not-evaluated checks."""
    mismatches: Counter[str] = Counter()
    incomparable: Counter[str] = Counter()
    not_evaluated: Counter[str] = Counter()
    comparison_counts = {
        "parserStructure": {"passed": 0, "failed": 0, "incomparable": 0},
        "svgUsedColorsSubsetOfColorsOf": {"passed": 0, "failed": 0, "notEvaluated": 0},
    }
    for row in rows:
        checks = row.get("checks", {})
        if not isinstance(checks, dict):
            raise MaterializationError("row is missing check results")
        for key, value in checks.items():
            if isinstance(value, bool) and not value:
                mismatches[key] += 1
        if "parserStructureStatus" in checks:
            status = checks["parserStructureStatus"]
            if status not in {"passed", "failed", "incomparable"}:
                raise MaterializationError("invalid parser structure comparison status")
            comparison_counts["parserStructure"][status] += 1
            if status == "failed":
                mismatches["parserStructure"] += 1
            elif status == "incomparable":
                incomparable["parserStructure"] += 1
        if "svgUsedColorsSubsetOfColorsOf" in checks:
            status = checks["svgUsedColorsSubsetOfColorsOf"]
            if status not in {"passed", "failed", "not-evaluated"}:
                raise MaterializationError("invalid SVG color-subset comparison status")
            bucket = "notEvaluated" if status == "not-evaluated" else status
            comparison_counts["svgUsedColorsSubsetOfColorsOf"][bucket] += 1
            if status == "failed":
                mismatches["svgUsedColorsSubsetOfColorsOf"] += 1
            elif status == "not-evaluated":
                not_evaluated["svgUsedColorsSubsetOfColorsOf"] += 1
    return {
        "definiteMismatchCount": sum(mismatches.values()),
        "mismatchCounts": dict(sorted(mismatches.items())),
        "incomparableCounts": dict(sorted(incomparable.items())),
        "notEvaluatedCounts": dict(sorted(not_evaluated.items())),
        "comparisonCounts": comparison_counts,
    }


def summarize_structural_geometry(rows: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    """Summarize normalized explicit-false dimensions and transparent margins."""
    dimensions: Counter[str] = Counter()
    viewbox_dimensions: Counter[str] = Counter()
    margins: Counter[str] = Counter()
    for row in rows:
        normalized = row.get("svg", {}).get("explicitFalseBytes5", {})
        if normalized.get("status") != "cell-normalized":
            continue
        logical = normalized.get("logicalDimensions", [])
        viewbox = normalized.get("viewBoxLogicalDimensions", [])
        transparent = normalized.get("transparentMargins", {})
        if len(logical) == 2:
            dimensions[f"{logical[0]}x{logical[1]}"] += 1
        if len(viewbox) == 2:
            viewbox_dimensions[f"{viewbox[0]}x{viewbox[1]}"] += 1
        if set(transparent) == {"left", "right", "top", "bottom"}:
            key = ",".join(f"{name}={transparent[name]}" for name in ("left", "right", "top", "bottom"))
            margins[key] += 1
    return {
        "tightDimensionCounts": dict(sorted(dimensions.items())),
        "viewBoxDimensionCounts": dict(sorted(viewbox_dimensions.items())),
        "transparentMarginCounts": dict(sorted(margins.items())),
    }


def rgb_triplets(colors: list[int]) -> list[str]:
    if len(colors) % 3:
        raise MaterializationError("color output is not divisible into RGB triplets")
    return ["#" + bytes(colors[index:index + 3]).hex() for index in range(0, len(colors), 3)]


def self_test() -> None:
    if keccak256(b"").hex() != "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470":
        raise MaterializationError("Ethereum Keccak self-test failed")
    if keccak256(b"transfer(address,uint256)")[:4].hex() != "a9059cbb":
        raise MaterializationError("Ethereum function-selector self-test failed")
    test_abi = {
        "abi": [
            {"type": "function", "name": "f", "inputs": [{"type": "bytes5"}, {"type": "uint256"}, {"type": "bool"}], "outputs": [{"type": "uint8[3]"}]},
            {"type": "function", "name": "s", "inputs": [], "outputs": [{"type": "string"}]},
            {"type": "function", "name": "a", "inputs": [], "outputs": [{"type": "address"}, {"type": "bytes5"}, {"type": "bool"}]},
            {"type": "function", "name": "t", "inputs": [], "outputs": [{"type": "tuple", "components": [{"name": "x", "type": "uint232"}, {"name": "y", "type": "uint8"}]}]},
        ]
    }
    encoded = encode_call(test_abi, "f(bytes5,uint256,bool)", ["0x0102030405", 7, True])
    if len(bytes.fromhex(encoded[2:])) != 4 + 96:
        raise MaterializationError("ABI encoder self-test failed")
    array_result = "0x" + (_word(1) + _word(2) + _word(3)).hex()
    if decode_outputs(test_abi, "f(bytes5,uint256,bool)", array_result) != [[1, 2, 3]]:
        raise MaterializationError("ABI fixed-array decoder self-test failed")
    raw = b"hello"
    string_result = "0x" + (_word(32) + _word(len(raw)) + raw.ljust(32, b"\0")).hex()
    if decode_outputs(test_abi, "s()", string_result) != ["hello"]:
        raise MaterializationError("ABI string decoder self-test failed")
    address = bytes.fromhex("11" * 20)
    mixed_result = "0x" + (address.rjust(32, b"\0") + bytes.fromhex("0102030405").ljust(32, b"\0") + _word(1)).hex()
    if decode_outputs(test_abi, "a()", mixed_result) != ["0x" + "11" * 20, "0x0102030405", True]:
        raise MaterializationError("ABI address/fixed-bytes decoder self-test failed")
    if decode_outputs(test_abi, "t()", "0x" + (_word(7) + _word(2)).hex()) != [{"x": 7, "y": 2}]:
        raise MaterializationError("ABI tuple decoder self-test failed")
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><defs><rect id="r" width="1" height="1"/></defs><g fill="#010203"><use href="#r" x="1" y="0"/></g></svg>'
    normalized = normalize_svg(svg)
    if normalized.get("status") != "cell-normalized" or normalized.get("occupiedCellCount") != 1 or normalized.get("usedHexColors") != ["#010203"]:
        raise MaterializationError("SVG cell normalizer self-test failed")
    mooncat_constructs = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 2">'
        '<defs><rect id="r" width="2" height="2"/></defs>'
        '<g transform="scale(-1,1) translate(-4,0)">'
        '<polygon points="0 0,4 0,4 2,0 2" fill="rgb(1,2,3)"/>'
        '<g fill="rgb(4,5,6)"><use href="#r" x="0" y="0"/></g>'
        '</g></svg>'
    )
    normalized_constructs = normalize_svg(mooncat_constructs)
    if (
        normalized_constructs.get("status") != "cell-normalized"
        or normalized_constructs.get("occupiedCellCount") != 2
        or normalized_constructs.get("usedHexColors") != ["#010203", "#040506"]
        or normalized_constructs.get("constructCounts") != {"polygon": 1, "transform": 1, "use": 1}
        or normalized_constructs.get("overdrawWriteCount") != 1
    ):
        raise MaterializationError("SVG MoonCat polygon/transform/rgb self-test failed")
    transparent_border = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 6">'
        '<defs><rect id="r" width="2" height="2"/></defs>'
        '<polygon points="2 2,4 2,4 4,2 4" fill="rgb(1,2,3)"/>'
        '</svg>'
    )
    normalized_border = normalize_svg(transparent_border)
    if (
        normalized_border.get("logicalDimensions") != [1, 1]
        or normalized_border.get("viewBoxLogicalDimensions") != [3, 3]
        or normalized_border.get("transparentMargins") != {"left": 1, "right": 1, "top": 1, "bottom": 1}
    ):
        raise MaterializationError("SVG transparent-border normalization self-test failed")
    geometry_summary = summarize_structural_geometry([{"svg": {"explicitFalseBytes5": normalized_border}}])
    if geometry_summary != {
        "tightDimensionCounts": {"1x1": 1},
        "viewBoxDimensionCounts": {"3x3": 1},
        "transparentMarginCounts": {"left=1,right=1,top=1,bottom=1": 1},
    }:
        raise MaterializationError("SVG structural geometry summary self-test failed")
    visible_rect = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><defs><rect id="r" width="1" height="1"/></defs><rect width="2" height="2" fill="#010203"/><use href="#r"/></svg>'
    if normalize_svg(visible_rect).get("status") != "incomparable-unsupported-svg-geometry":
        raise MaterializationError("SVG unsupported-geometry self-test failed")
    rotated = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 2"><defs><rect id="r" width="1" height="1"/></defs><g transform="rotate(90)"><use href="#r" fill="#010203"/></g></svg>'
    rotated_result = normalize_svg(rotated)
    if rotated_result.get("status") != "incomparable-unsupported-svg-geometry" or rotated_result.get("unsupported") != ["unsupported-transform"]:
        raise MaterializationError("SVG unsupported-transform self-test failed")
    accounting = summarize_check_accounting([
        {"checks": {"requiredAssertion": True, "parserStructureStatus": "incomparable", "svgUsedColorsSubsetOfColorsOf": "not-evaluated"}},
        {"checks": {"requiredAssertion": False, "parserStructureStatus": "failed", "svgUsedColorsSubsetOfColorsOf": "failed"}},
    ])
    if (
        accounting["mismatchCounts"] != {"parserStructure": 1, "requiredAssertion": 1, "svgUsedColorsSubsetOfColorsOf": 1}
        or accounting["incomparableCounts"] != {"parserStructure": 1}
        or accounting["notEvaluatedCounts"] != {"svgUsedColorsSubsetOfColorsOf": 1}
        or accounting["definiteMismatchCount"] != 3
    ):
        raise MaterializationError("comparison accounting self-test failed")
