// copyright ©2021 ponderware
// licensed under the AGPL v3, see https://www.gnu.org/licenses/agpl-3.0.en.html

// The above copyright and licensing exclude the embedded nodeca/pako code which is licensed under a combination of MIT & ZLIB licenses. See https://github.com/nodeca/pako

if(typeof Math.imul == "undefined" || (Math.imul(0xffffffff,5) == 0)) {
    Math.imul = function (a, b) {
        var ah  = (a >>> 16) & 0xffff;
        var al = a & 0xffff;
        var bh  = (b >>> 16) & 0xffff;
        var bl = b & 0xffff;
        // the shift by 0 fixes the sign on the high part
        // the final |0 converts the unsigned value into a signed value
        return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
    }
}

/* pako 0.2.7 nodeca/pako */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.pako=t()}}(function(){return function t(e,a,i){function n(s,o){if(!a[s]){if(!e[s]){var l="function"==typeof require&&require;if(!o&&l)return l(s,!0);if(r)return r(s,!0);var h=new Error("Cannot find module '"+s+"'");throw h.code="MODULE_NOT_FOUND",h}var d=a[s]={exports:{}};e[s][0].call(d.exports,function(t){var a=e[s][1][t];return n(a?a:t)},d,d.exports,t,e,a,i)}return a[s].exports}for(var r="function"==typeof require&&require,s=0;s<i.length;s++)n(i[s]);return n}({1:[function(t,e,a){"use strict";function i(t,e){var a=new v(e);if(a.push(t,!0),a.err)throw a.msg;return a.result}function n(t,e){return e=e||{},e.raw=!0,i(t,e)}function r(t,e){return e=e||{},e.gzip=!0,i(t,e)}var s=t("./zlib/deflate.js"),o=t("./utils/common"),l=t("./utils/strings"),h=t("./zlib/messages"),d=t("./zlib/zstream"),f=Object.prototype.toString,_=0,u=4,c=0,b=1,g=2,m=-1,w=0,p=8,v=function(t){this.options=o.assign({level:m,method:p,chunkSize:16384,windowBits:15,memLevel:8,strategy:w,to:""},t||{});var e=this.options;e.raw&&e.windowBits>0?e.windowBits=-e.windowBits:e.gzip&&e.windowBits>0&&e.windowBits<16&&(e.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new d,this.strm.avail_out=0;var a=s.deflateInit2(this.strm,e.level,e.method,e.windowBits,e.memLevel,e.strategy);if(a!==c)throw new Error(h[a]);e.header&&s.deflateSetHeader(this.strm,e.header)};v.prototype.push=function(t,e){var a,i,n=this.strm,r=this.options.chunkSize;if(this.ended)return!1;i=e===~~e?e:e===!0?u:_,"string"==typeof t?n.input=l.string2buf(t):"[object ArrayBuffer]"===f.call(t)?n.input=new Uint8Array(t):n.input=t,n.next_in=0,n.avail_in=n.input.length;do{if(0===n.avail_out&&(n.output=new o.Buf8(r),n.next_out=0,n.avail_out=r),a=s.deflate(n,i),a!==b&&a!==c)return this.onEnd(a),this.ended=!0,!1;(0===n.avail_out||0===n.avail_in&&(i===u||i===g))&&this.onData("string"===this.options.to?l.buf2binstring(o.shrinkBuf(n.output,n.next_out)):o.shrinkBuf(n.output,n.next_out))}while((n.avail_in>0||0===n.avail_out)&&a!==b);return i===u?(a=s.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===c):i===g?(this.onEnd(c),n.avail_out=0,!0):!0},v.prototype.onData=function(t){this.chunks.push(t)},v.prototype.onEnd=function(t){t===c&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=o.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Deflate=v,a.deflate=i,a.deflateRaw=n,a.gzip=r},{"./utils/common":3,"./utils/strings":4,"./zlib/deflate.js":8,"./zlib/messages":13,"./zlib/zstream":15}],2:[function(t,e,a){"use strict";function i(t,e){var a=new u(e);if(a.push(t,!0),a.err)throw a.msg;return a.result}function n(t,e){return e=e||{},e.raw=!0,i(t,e)}var r=t("./zlib/inflate.js"),s=t("./utils/common"),o=t("./utils/strings"),l=t("./zlib/constants"),h=t("./zlib/messages"),d=t("./zlib/zstream"),f=t("./zlib/gzheader"),_=Object.prototype.toString,u=function(t){this.options=s.assign({chunkSize:16384,windowBits:0,to:""},t||{});var e=this.options;e.raw&&e.windowBits>=0&&e.windowBits<16&&(e.windowBits=-e.windowBits,0===e.windowBits&&(e.windowBits=-15)),!(e.windowBits>=0&&e.windowBits<16)||t&&t.windowBits||(e.windowBits+=32),e.windowBits>15&&e.windowBits<48&&0===(15&e.windowBits)&&(e.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new d,this.strm.avail_out=0;var a=r.inflateInit2(this.strm,e.windowBits);if(a!==l.Z_OK)throw new Error(h[a]);this.header=new f,r.inflateGetHeader(this.strm,this.header)};u.prototype.push=function(t,e){var a,i,n,h,d,f=this.strm,u=this.options.chunkSize;if(this.ended)return!1;i=e===~~e?e:e===!0?l.Z_FINISH:l.Z_NO_FLUSH,"string"==typeof t?f.input=o.binstring2buf(t):"[object ArrayBuffer]"===_.call(t)?f.input=new Uint8Array(t):f.input=t,f.next_in=0,f.avail_in=f.input.length;do{if(0===f.avail_out&&(f.output=new s.Buf8(u),f.next_out=0,f.avail_out=u),a=r.inflate(f,l.Z_NO_FLUSH),a!==l.Z_STREAM_END&&a!==l.Z_OK)return this.onEnd(a),this.ended=!0,!1;f.next_out&&(0===f.avail_out||a===l.Z_STREAM_END||0===f.avail_in&&(i===l.Z_FINISH||i===l.Z_SYNC_FLUSH))&&("string"===this.options.to?(n=o.utf8border(f.output,f.next_out),h=f.next_out-n,d=o.buf2string(f.output,n),f.next_out=h,f.avail_out=u-h,h&&s.arraySet(f.output,f.output,n,h,0),this.onData(d)):this.onData(s.shrinkBuf(f.output,f.next_out)))}while(f.avail_in>0&&a!==l.Z_STREAM_END);return a===l.Z_STREAM_END&&(i=l.Z_FINISH),i===l.Z_FINISH?(a=r.inflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===l.Z_OK):i===l.Z_SYNC_FLUSH?(this.onEnd(l.Z_OK),f.avail_out=0,!0):!0},u.prototype.onData=function(t){this.chunks.push(t)},u.prototype.onEnd=function(t){t===l.Z_OK&&("string"===this.options.to?this.result=this.chunks.join(""):this.result=s.flattenChunks(this.chunks)),this.chunks=[],this.err=t,this.msg=this.strm.msg},a.Inflate=u,a.inflate=i,a.inflateRaw=n,a.ungzip=i},{"./utils/common":3,"./utils/strings":4,"./zlib/constants":6,"./zlib/gzheader":9,"./zlib/inflate.js":11,"./zlib/messages":13,"./zlib/zstream":15}],3:[function(t,e,a){"use strict";var i="undefined"!=typeof Uint8Array&&"undefined"!=typeof Uint16Array&&"undefined"!=typeof Int32Array;a.assign=function(t){for(var e=Array.prototype.slice.call(arguments,1);e.length;){var a=e.shift();if(a){if("object"!=typeof a)throw new TypeError(a+"must be non-object");for(var i in a)a.hasOwnProperty(i)&&(t[i]=a[i])}}return t},a.shrinkBuf=function(t,e){return t.length===e?t:t.subarray?t.subarray(0,e):(t.length=e,t)};var n={arraySet:function(t,e,a,i,n){if(e.subarray&&t.subarray)return void t.set(e.subarray(a,a+i),n);for(var r=0;i>r;r++)t[n+r]=e[a+r]},flattenChunks:function(t){var e,a,i,n,r,s;for(i=0,e=0,a=t.length;a>e;e++)i+=t[e].length;for(s=new Uint8Array(i),n=0,e=0,a=t.length;a>e;e++)r=t[e],s.set(r,n),n+=r.length;return s}},r={arraySet:function(t,e,a,i,n){for(var r=0;i>r;r++)t[n+r]=e[a+r]},flattenChunks:function(t){return[].concat.apply([],t)}};a.setTyped=function(t){t?(a.Buf8=Uint8Array,a.Buf16=Uint16Array,a.Buf32=Int32Array,a.assign(a,n)):(a.Buf8=Array,a.Buf16=Array,a.Buf32=Array,a.assign(a,r))},a.setTyped(i)},{}],4:[function(t,e,a){"use strict";function i(t,e){if(65537>e&&(t.subarray&&s||!t.subarray&&r))return String.fromCharCode.apply(null,n.shrinkBuf(t,e));for(var a="",i=0;e>i;i++)a+=String.fromCharCode(t[i]);return a}var n=t("./common"),r=!0,s=!0;try{String.fromCharCode.apply(null,[0])}catch(o){r=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch(o){s=!1}for(var l=new n.Buf8(256),h=0;256>h;h++)l[h]=h>=252?6:h>=248?5:h>=240?4:h>=224?3:h>=192?2:1;l[254]=l[254]=1,a.string2buf=function(t){var e,a,i,r,s,o=t.length,l=0;for(r=0;o>r;r++)a=t.charCodeAt(r),55296===(64512&a)&&o>r+1&&(i=t.charCodeAt(r+1),56320===(64512&i)&&(a=65536+(a-55296<<10)+(i-56320),r++)),l+=128>a?1:2048>a?2:65536>a?3:4;for(e=new n.Buf8(l),s=0,r=0;l>s;r++)a=t.charCodeAt(r),55296===(64512&a)&&o>r+1&&(i=t.charCodeAt(r+1),56320===(64512&i)&&(a=65536+(a-55296<<10)+(i-56320),r++)),128>a?e[s++]=a:2048>a?(e[s++]=192|a>>>6,e[s++]=128|63&a):65536>a?(e[s++]=224|a>>>12,e[s++]=128|a>>>6&63,e[s++]=128|63&a):(e[s++]=240|a>>>18,e[s++]=128|a>>>12&63,e[s++]=128|a>>>6&63,e[s++]=128|63&a);return e},a.buf2binstring=function(t){return i(t,t.length)},a.binstring2buf=function(t){for(var e=new n.Buf8(t.length),a=0,i=e.length;i>a;a++)e[a]=t.charCodeAt(a);return e},a.buf2string=function(t,e){var a,n,r,s,o=e||t.length,h=new Array(2*o);for(n=0,a=0;o>a;)if(r=t[a++],128>r)h[n++]=r;else if(s=l[r],s>4)h[n++]=65533,a+=s-1;else{for(r&=2===s?31:3===s?15:7;s>1&&o>a;)r=r<<6|63&t[a++],s--;s>1?h[n++]=65533:65536>r?h[n++]=r:(r-=65536,h[n++]=55296|r>>10&1023,h[n++]=56320|1023&r)}return i(h,n)},a.utf8border=function(t,e){var a;for(e=e||t.length,e>t.length&&(e=t.length),a=e-1;a>=0&&128===(192&t[a]);)a--;return 0>a?e:0===a?e:a+l[t[a]]>e?a:e}},{"./common":3}],5:[function(t,e,a){"use strict";function i(t,e,a,i){for(var n=65535&t|0,r=t>>>16&65535|0,s=0;0!==a;){s=a>2e3?2e3:a,a-=s;do n=n+e[i++]|0,r=r+n|0;while(--s);n%=65521,r%=65521}return n|r<<16|0}e.exports=i},{}],6:[function(t,e,a){e.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],7:[function(t,e,a){"use strict";function i(){for(var t,e=[],a=0;256>a;a++){t=a;for(var i=0;8>i;i++)t=1&t?3988292384^t>>>1:t>>>1;e[a]=t}return e}function n(t,e,a,i){var n=r,s=i+a;t=-1^t;for(var o=i;s>o;o++)t=t>>>8^n[255&(t^e[o])];return-1^t}var r=i();e.exports=n},{}],8:[function(t,e,a){"use strict";function i(t,e){return t.msg=N[e],e}function n(t){return(t<<1)-(t>4?9:0)}function r(t){for(var e=t.length;--e>=0;)t[e]=0}function s(t){var e=t.state,a=e.pending;a>t.avail_out&&(a=t.avail_out),0!==a&&(A.arraySet(t.output,e.pending_buf,e.pending_out,a,t.next_out),t.next_out+=a,e.pending_out+=a,t.total_out+=a,t.avail_out-=a,e.pending-=a,0===e.pending&&(e.pending_out=0))}function o(t,e){Z._tr_flush_block(t,t.block_start>=0?t.block_start:-1,t.strstart-t.block_start,e),t.block_start=t.strstart,s(t.strm)}function l(t,e){t.pending_buf[t.pending++]=e}function h(t,e){t.pending_buf[t.pending++]=e>>>8&255,t.pending_buf[t.pending++]=255&e}function d(t,e,a,i){var n=t.avail_in;return n>i&&(n=i),0===n?0:(t.avail_in-=n,A.arraySet(e,t.input,t.next_in,n,a),1===t.state.wrap?t.adler=R(t.adler,e,n,a):2===t.state.wrap&&(t.adler=C(t.adler,e,n,a)),t.next_in+=n,t.total_in+=n,n)}function f(t,e){var a,i,n=t.max_chain_length,r=t.strstart,s=t.prev_length,o=t.nice_match,l=t.strstart>t.w_size-ht?t.strstart-(t.w_size-ht):0,h=t.window,d=t.w_mask,f=t.prev,_=t.strstart+lt,u=h[r+s-1],c=h[r+s];t.prev_length>=t.good_match&&(n>>=2),o>t.lookahead&&(o=t.lookahead);do if(a=e,h[a+s]===c&&h[a+s-1]===u&&h[a]===h[r]&&h[++a]===h[r+1]){r+=2,a++;do;while(h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&h[++r]===h[++a]&&_>r);if(i=lt-(_-r),r=_-lt,i>s){if(t.match_start=e,s=i,i>=o)break;u=h[r+s-1],c=h[r+s]}}while((e=f[e&d])>l&&0!==--n);return s<=t.lookahead?s:t.lookahead}function _(t){var e,a,i,n,r,s=t.w_size;do{if(n=t.window_size-t.lookahead-t.strstart,t.strstart>=s+(s-ht)){A.arraySet(t.window,t.window,s,s,0),t.match_start-=s,t.strstart-=s,t.block_start-=s,a=t.hash_size,e=a;do i=t.head[--e],t.head[e]=i>=s?i-s:0;while(--a);a=s,e=a;do i=t.prev[--e],t.prev[e]=i>=s?i-s:0;while(--a);n+=s}if(0===t.strm.avail_in)break;if(a=d(t.strm,t.window,t.strstart+t.lookahead,n),t.lookahead+=a,t.lookahead+t.insert>=ot)for(r=t.strstart-t.insert,t.ins_h=t.window[r],t.ins_h=(t.ins_h<<t.hash_shift^t.window[r+1])&t.hash_mask;t.insert&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[r+ot-1])&t.hash_mask,t.prev[r&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=r,r++,t.insert--,!(t.lookahead+t.insert<ot)););}while(t.lookahead<ht&&0!==t.strm.avail_in)}function u(t,e){var a=65535;for(a>t.pending_buf_size-5&&(a=t.pending_buf_size-5);;){if(t.lookahead<=1){if(_(t),0===t.lookahead&&e===I)return wt;if(0===t.lookahead)break}t.strstart+=t.lookahead,t.lookahead=0;var i=t.block_start+a;if((0===t.strstart||t.strstart>=i)&&(t.lookahead=t.strstart-i,t.strstart=i,o(t,!1),0===t.strm.avail_out))return wt;if(t.strstart-t.block_start>=t.w_size-ht&&(o(t,!1),0===t.strm.avail_out))return wt}return t.insert=0,e===U?(o(t,!0),0===t.strm.avail_out?vt:kt):t.strstart>t.block_start&&(o(t,!1),0===t.strm.avail_out)?wt:wt}function c(t,e){for(var a,i;;){if(t.lookahead<ht){if(_(t),t.lookahead<ht&&e===I)return wt;if(0===t.lookahead)break}if(a=0,t.lookahead>=ot&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ot-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),0!==a&&t.strstart-a<=t.w_size-ht&&(t.match_length=f(t,a)),t.match_length>=ot)if(i=Z._tr_tally(t,t.strstart-t.match_start,t.match_length-ot),t.lookahead-=t.match_length,t.match_length<=t.max_lazy_match&&t.lookahead>=ot){t.match_length--;do t.strstart++,t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ot-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart;while(0!==--t.match_length);t.strstart++}else t.strstart+=t.match_length,t.match_length=0,t.ins_h=t.window[t.strstart],t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+1])&t.hash_mask;else i=Z._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++;if(i&&(o(t,!1),0===t.strm.avail_out))return wt}return t.insert=t.strstart<ot-1?t.strstart:ot-1,e===U?(o(t,!0),0===t.strm.avail_out?vt:kt):t.last_lit&&(o(t,!1),0===t.strm.avail_out)?wt:pt}function b(t,e){for(var a,i,n;;){if(t.lookahead<ht){if(_(t),t.lookahead<ht&&e===I)return wt;if(0===t.lookahead)break}if(a=0,t.lookahead>=ot&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ot-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart),t.prev_length=t.match_length,t.prev_match=t.match_start,t.match_length=ot-1,0!==a&&t.prev_length<t.max_lazy_match&&t.strstart-a<=t.w_size-ht&&(t.match_length=f(t,a),t.match_length<=5&&(t.strategy===P||t.match_length===ot&&t.strstart-t.match_start>4096)&&(t.match_length=ot-1)),t.prev_length>=ot&&t.match_length<=t.prev_length){n=t.strstart+t.lookahead-ot,i=Z._tr_tally(t,t.strstart-1-t.prev_match,t.prev_length-ot),t.lookahead-=t.prev_length-1,t.prev_length-=2;do++t.strstart<=n&&(t.ins_h=(t.ins_h<<t.hash_shift^t.window[t.strstart+ot-1])&t.hash_mask,a=t.prev[t.strstart&t.w_mask]=t.head[t.ins_h],t.head[t.ins_h]=t.strstart);while(0!==--t.prev_length);if(t.match_available=0,t.match_length=ot-1,t.strstart++,i&&(o(t,!1),0===t.strm.avail_out))return wt}else if(t.match_available){if(i=Z._tr_tally(t,0,t.window[t.strstart-1]),i&&o(t,!1),t.strstart++,t.lookahead--,0===t.strm.avail_out)return wt}else t.match_available=1,t.strstart++,t.lookahead--}return t.match_available&&(i=Z._tr_tally(t,0,t.window[t.strstart-1]),t.match_available=0),t.insert=t.strstart<ot-1?t.strstart:ot-1,e===U?(o(t,!0),0===t.strm.avail_out?vt:kt):t.last_lit&&(o(t,!1),0===t.strm.avail_out)?wt:pt}function g(t,e){for(var a,i,n,r,s=t.window;;){if(t.lookahead<=lt){if(_(t),t.lookahead<=lt&&e===I)return wt;if(0===t.lookahead)break}if(t.match_length=0,t.lookahead>=ot&&t.strstart>0&&(n=t.strstart-1,i=s[n],i===s[++n]&&i===s[++n]&&i===s[++n])){r=t.strstart+lt;do;while(i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&i===s[++n]&&r>n);t.match_length=lt-(r-n),t.match_length>t.lookahead&&(t.match_length=t.lookahead)}if(t.match_length>=ot?(a=Z._tr_tally(t,1,t.match_length-ot),t.lookahead-=t.match_length,t.strstart+=t.match_length,t.match_length=0):(a=Z._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++),a&&(o(t,!1),0===t.strm.avail_out))return wt}return t.insert=0,e===U?(o(t,!0),0===t.strm.avail_out?vt:kt):t.last_lit&&(o(t,!1),0===t.strm.avail_out)?wt:pt}function m(t,e){for(var a;;){if(0===t.lookahead&&(_(t),0===t.lookahead)){if(e===I)return wt;break}if(t.match_length=0,a=Z._tr_tally(t,0,t.window[t.strstart]),t.lookahead--,t.strstart++,a&&(o(t,!1),0===t.strm.avail_out))return wt}return t.insert=0,e===U?(o(t,!0),0===t.strm.avail_out?vt:kt):t.last_lit&&(o(t,!1),0===t.strm.avail_out)?wt:pt}function w(t){t.window_size=2*t.w_size,r(t.head),t.max_lazy_match=E[t.level].max_lazy,t.good_match=E[t.level].good_length,t.nice_match=E[t.level].nice_length,t.max_chain_length=E[t.level].max_chain,t.strstart=0,t.block_start=0,t.lookahead=0,t.insert=0,t.match_length=t.prev_length=ot-1,t.match_available=0,t.ins_h=0}function p(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=J,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new A.Buf16(2*rt),this.dyn_dtree=new A.Buf16(2*(2*it+1)),this.bl_tree=new A.Buf16(2*(2*nt+1)),r(this.dyn_ltree),r(this.dyn_dtree),r(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new A.Buf16(st+1),this.heap=new A.Buf16(2*at+1),r(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new A.Buf16(2*at+1),r(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function v(t){var e;return t&&t.state?(t.total_in=t.total_out=0,t.data_type=W,e=t.state,e.pending=0,e.pending_out=0,e.wrap<0&&(e.wrap=-e.wrap),e.status=e.wrap?ft:gt,t.adler=2===e.wrap?0:1,e.last_flush=I,Z._tr_init(e),F):i(t,H)}function k(t){var e=v(t);return e===F&&w(t.state),e}function x(t,e){return t&&t.state?2!==t.state.wrap?H:(t.state.gzhead=e,F):H}function y(t,e,a,n,r,s){if(!t)return H;var o=1;if(e===K&&(e=6),0>n?(o=0,n=-n):n>15&&(o=2,n-=16),1>r||r>Q||a!==J||8>n||n>15||0>e||e>9||0>s||s>G)return i(t,H);8===n&&(n=9);var l=new p;return t.state=l,l.strm=t,l.wrap=o,l.gzhead=null,l.w_bits=n,l.w_size=1<<l.w_bits,l.w_mask=l.w_size-1,l.hash_bits=r+7,l.hash_size=1<<l.hash_bits,l.hash_mask=l.hash_size-1,l.hash_shift=~~((l.hash_bits+ot-1)/ot),l.window=new A.Buf8(2*l.w_size),l.head=new A.Buf16(l.hash_size),l.prev=new A.Buf16(l.w_size),l.lit_bufsize=1<<r+6,l.pending_buf_size=4*l.lit_bufsize,l.pending_buf=new A.Buf8(l.pending_buf_size),l.d_buf=l.lit_bufsize>>1,l.l_buf=3*l.lit_bufsize,l.level=e,l.strategy=s,l.method=a,k(t)}function z(t,e){return y(t,e,J,V,$,X)}function B(t,e){var a,o,d,f;if(!t||!t.state||e>D||0>e)return t?i(t,H):H;if(o=t.state,!t.output||!t.input&&0!==t.avail_in||o.status===mt&&e!==U)return i(t,0===t.avail_out?M:H);if(o.strm=t,a=o.last_flush,o.last_flush=e,o.status===ft)if(2===o.wrap)t.adler=0,l(o,31),l(o,139),l(o,8),o.gzhead?(l(o,(o.gzhead.text?1:0)+(o.gzhead.hcrc?2:0)+(o.gzhead.extra?4:0)+(o.gzhead.name?8:0)+(o.gzhead.comment?16:0)),l(o,255&o.gzhead.time),l(o,o.gzhead.time>>8&255),l(o,o.gzhead.time>>16&255),l(o,o.gzhead.time>>24&255),l(o,9===o.level?2:o.strategy>=Y||o.level<2?4:0),l(o,255&o.gzhead.os),o.gzhead.extra&&o.gzhead.extra.length&&(l(o,255&o.gzhead.extra.length),l(o,o.gzhead.extra.length>>8&255)),o.gzhead.hcrc&&(t.adler=C(t.adler,o.pending_buf,o.pending,0)),o.gzindex=0,o.status=_t):(l(o,0),l(o,0),l(o,0),l(o,0),l(o,0),l(o,9===o.level?2:o.strategy>=Y||o.level<2?4:0),l(o,xt),o.status=gt);else{var _=J+(o.w_bits-8<<4)<<8,u=-1;u=o.strategy>=Y||o.level<2?0:o.level<6?1:6===o.level?2:3,_|=u<<6,0!==o.strstart&&(_|=dt),_+=31-_%31,o.status=gt,h(o,_),0!==o.strstart&&(h(o,t.adler>>>16),h(o,65535&t.adler)),t.adler=1}if(o.status===_t)if(o.gzhead.extra){for(d=o.pending;o.gzindex<(65535&o.gzhead.extra.length)&&(o.pending!==o.pending_buf_size||(o.gzhead.hcrc&&o.pending>d&&(t.adler=C(t.adler,o.pending_buf,o.pending-d,d)),s(t),d=o.pending,o.pending!==o.pending_buf_size));)l(o,255&o.gzhead.extra[o.gzindex]),o.gzindex++;o.gzhead.hcrc&&o.pending>d&&(t.adler=C(t.adler,o.pending_buf,o.pending-d,d)),o.gzindex===o.gzhead.extra.length&&(o.gzindex=0,o.status=ut)}else o.status=ut;if(o.status===ut)if(o.gzhead.name){d=o.pending;do{if(o.pending===o.pending_buf_size&&(o.gzhead.hcrc&&o.pending>d&&(t.adler=C(t.adler,o.pending_buf,o.pending-d,d)),s(t),d=o.pending,o.pending===o.pending_buf_size)){f=1;break}f=o.gzindex<o.gzhead.name.length?255&o.gzhead.name.charCodeAt(o.gzindex++):0,l(o,f)}while(0!==f);o.gzhead.hcrc&&o.pending>d&&(t.adler=C(t.adler,o.pending_buf,o.pending-d,d)),0===f&&(o.gzindex=0,o.status=ct)}else o.status=ct;if(o.status===ct)if(o.gzhead.comment){d=o.pending;do{if(o.pending===o.pending_buf_size&&(o.gzhead.hcrc&&o.pending>d&&(t.adler=C(t.adler,o.pending_buf,o.pending-d,d)),s(t),d=o.pending,o.pending===o.pending_buf_size)){f=1;break}f=o.gzindex<o.gzhead.comment.length?255&o.gzhead.comment.charCodeAt(o.gzindex++):0,l(o,f)}while(0!==f);o.gzhead.hcrc&&o.pending>d&&(t.adler=C(t.adler,o.pending_buf,o.pending-d,d)),0===f&&(o.status=bt)}else o.status=bt;if(o.status===bt&&(o.gzhead.hcrc?(o.pending+2>o.pending_buf_size&&s(t),o.pending+2<=o.pending_buf_size&&(l(o,255&t.adler),l(o,t.adler>>8&255),t.adler=0,o.status=gt)):o.status=gt),0!==o.pending){if(s(t),0===t.avail_out)return o.last_flush=-1,F}else if(0===t.avail_in&&n(e)<=n(a)&&e!==U)return i(t,M);if(o.status===mt&&0!==t.avail_in)return i(t,M);if(0!==t.avail_in||0!==o.lookahead||e!==I&&o.status!==mt){var c=o.strategy===Y?m(o,e):o.strategy===q?g(o,e):E[o.level].func(o,e);if((c===vt||c===kt)&&(o.status=mt),c===wt||c===vt)return 0===t.avail_out&&(o.last_flush=-1),F;if(c===pt&&(e===O?Z._tr_align(o):e!==D&&(Z._tr_stored_block(o,0,0,!1),e===T&&(r(o.head),0===o.lookahead&&(o.strstart=0,o.block_start=0,o.insert=0))),s(t),0===t.avail_out))return o.last_flush=-1,F}return e!==U?F:o.wrap<=0?L:(2===o.wrap?(l(o,255&t.adler),l(o,t.adler>>8&255),l(o,t.adler>>16&255),l(o,t.adler>>24&255),l(o,255&t.total_in),l(o,t.total_in>>8&255),l(o,t.total_in>>16&255),l(o,t.total_in>>24&255)):(h(o,t.adler>>>16),h(o,65535&t.adler)),s(t),o.wrap>0&&(o.wrap=-o.wrap),0!==o.pending?F:L)}function S(t){var e;return t&&t.state?(e=t.state.status,e!==ft&&e!==_t&&e!==ut&&e!==ct&&e!==bt&&e!==gt&&e!==mt?i(t,H):(t.state=null,e===gt?i(t,j):F)):H}var E,A=t("../utils/common"),Z=t("./trees"),R=t("./adler32"),C=t("./crc32"),N=t("./messages"),I=0,O=1,T=3,U=4,D=5,F=0,L=1,H=-2,j=-3,M=-5,K=-1,P=1,Y=2,q=3,G=4,X=0,W=2,J=8,Q=9,V=15,$=8,tt=29,et=256,at=et+1+tt,it=30,nt=19,rt=2*at+1,st=15,ot=3,lt=258,ht=lt+ot+1,dt=32,ft=42,_t=69,ut=73,ct=91,bt=103,gt=113,mt=666,wt=1,pt=2,vt=3,kt=4,xt=3,yt=function(t,e,a,i,n){this.good_length=t,this.max_lazy=e,this.nice_length=a,this.max_chain=i,this.func=n};E=[new yt(0,0,0,0,u),new yt(4,4,8,4,c),new yt(4,5,16,8,c),new yt(4,6,32,32,c),new yt(4,4,16,16,b),new yt(8,16,32,32,b),new yt(8,16,128,128,b),new yt(8,32,128,256,b),new yt(32,128,258,1024,b),new yt(32,258,258,4096,b)],a.deflateInit=z,a.deflateInit2=y,a.deflateReset=k,a.deflateResetKeep=v,a.deflateSetHeader=x,a.deflate=B,a.deflateEnd=S,a.deflateInfo="pako deflate (from Nodeca project)"},{"../utils/common":3,"./adler32":5,"./crc32":7,"./messages":13,"./trees":14}],9:[function(t,e,a){"use strict";function i(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}e.exports=i},{}],10:[function(t,e,a){"use strict";var i=30,n=12;e.exports=function(t,e){var a,r,s,o,l,h,d,f,_,u,c,b,g,m,w,p,v,k,x,y,z,B,S,E,A;a=t.state,r=t.next_in,E=t.input,s=r+(t.avail_in-5),o=t.next_out,A=t.output,l=o-(e-t.avail_out),h=o+(t.avail_out-257),d=a.dmax,f=a.wsize,_=a.whave,u=a.wnext,c=a.window,b=a.hold,g=a.bits,m=a.lencode,w=a.distcode,p=(1<<a.lenbits)-1,v=(1<<a.distbits)-1;t:do{15>g&&(b+=E[r++]<<g,g+=8,b+=E[r++]<<g,g+=8),k=m[b&p];e:for(;;){if(x=k>>>24,b>>>=x,g-=x,x=k>>>16&255,0===x)A[o++]=65535&k;else{if(!(16&x)){if(0===(64&x)){k=m[(65535&k)+(b&(1<<x)-1)];continue e}if(32&x){a.mode=n;break t}t.msg="invalid literal/length code",a.mode=i;break t}y=65535&k,x&=15,x&&(x>g&&(b+=E[r++]<<g,g+=8),y+=b&(1<<x)-1,b>>>=x,g-=x),15>g&&(b+=E[r++]<<g,g+=8,b+=E[r++]<<g,g+=8),k=w[b&v];a:for(;;){if(x=k>>>24,b>>>=x,g-=x,x=k>>>16&255,!(16&x)){if(0===(64&x)){k=w[(65535&k)+(b&(1<<x)-1)];continue a}t.msg="invalid distance code",a.mode=i;break t}if(z=65535&k,x&=15,x>g&&(b+=E[r++]<<g,g+=8,x>g&&(b+=E[r++]<<g,g+=8)),z+=b&(1<<x)-1,z>d){t.msg="invalid distance too far back",a.mode=i;break t}if(b>>>=x,g-=x,x=o-l,z>x){if(x=z-x,x>_&&a.sane){t.msg="invalid distance too far back",a.mode=i;break t}if(B=0,S=c,0===u){if(B+=f-x,y>x){y-=x;do A[o++]=c[B++];while(--x);B=o-z,S=A}}else if(x>u){if(B+=f+u-x,x-=u,y>x){y-=x;do A[o++]=c[B++];while(--x);if(B=0,y>u){x=u,y-=x;do A[o++]=c[B++];while(--x);B=o-z,S=A}}}else if(B+=u-x,y>x){y-=x;do A[o++]=c[B++];while(--x);B=o-z,S=A}for(;y>2;)A[o++]=S[B++],A[o++]=S[B++],A[o++]=S[B++],y-=3;y&&(A[o++]=S[B++],y>1&&(A[o++]=S[B++]))}else{B=o-z;do A[o++]=A[B++],A[o++]=A[B++],A[o++]=A[B++],y-=3;while(y>2);y&&(A[o++]=A[B++],y>1&&(A[o++]=A[B++]))}break}}break}}while(s>r&&h>o);y=g>>3,r-=y,g-=y<<3,b&=(1<<g)-1,t.next_in=r,t.next_out=o,t.avail_in=s>r?5+(s-r):5-(r-s),t.avail_out=h>o?257+(h-o):257-(o-h),a.hold=b,a.bits=g}},{}],11:[function(t,e,a){"use strict";function i(t){return(t>>>24&255)+(t>>>8&65280)+((65280&t)<<8)+((255&t)<<24)}function n(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new m.Buf16(320),this.work=new m.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function r(t){var e;return t&&t.state?(e=t.state,t.total_in=t.total_out=e.total=0,t.msg="",e.wrap&&(t.adler=1&e.wrap),e.mode=U,e.last=0,e.havedict=0,e.dmax=32768,e.head=null,e.hold=0,e.bits=0,e.lencode=e.lendyn=new m.Buf32(ct),e.distcode=e.distdyn=new m.Buf32(bt),e.sane=1,e.back=-1,A):C}function s(t){var e;return t&&t.state?(e=t.state,e.wsize=0,e.whave=0,e.wnext=0,r(t)):C}function o(t,e){var a,i;return t&&t.state?(i=t.state,0>e?(a=0,e=-e):(a=(e>>4)+1,48>e&&(e&=15)),e&&(8>e||e>15)?C:(null!==i.window&&i.wbits!==e&&(i.window=null),i.wrap=a,i.wbits=e,s(t))):C}function l(t,e){var a,i;return t?(i=new n,t.state=i,i.window=null,a=o(t,e),a!==A&&(t.state=null),a):C}function h(t){return l(t,mt)}function d(t){if(wt){var e;for(b=new m.Buf32(512),g=new m.Buf32(32),e=0;144>e;)t.lens[e++]=8;for(;256>e;)t.lens[e++]=9;for(;280>e;)t.lens[e++]=7;for(;288>e;)t.lens[e++]=8;for(k(y,t.lens,0,288,b,0,t.work,{bits:9}),e=0;32>e;)t.lens[e++]=5;k(z,t.lens,0,32,g,0,t.work,{bits:5}),wt=!1}t.lencode=b,t.lenbits=9,t.distcode=g,t.distbits=5}function f(t,e,a,i){var n,r=t.state;return null===r.window&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new m.Buf8(r.wsize)),i>=r.wsize?(m.arraySet(r.window,e,a-r.wsize,r.wsize,0),r.wnext=0,r.whave=r.wsize):(n=r.wsize-r.wnext,n>i&&(n=i),m.arraySet(r.window,e,a-i,n,r.wnext),i-=n,i?(m.arraySet(r.window,e,a-i,i,0),r.wnext=i,r.whave=r.wsize):(r.wnext+=n,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=n))),0}function _(t,e){var a,n,r,s,o,l,h,_,u,c,b,g,ct,bt,gt,mt,wt,pt,vt,kt,xt,yt,zt,Bt,St=0,Et=new m.Buf8(4),At=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!t||!t.state||!t.output||!t.input&&0!==t.avail_in)return C;a=t.state,a.mode===G&&(a.mode=X),o=t.next_out,r=t.output,h=t.avail_out,s=t.next_in,n=t.input,l=t.avail_in,_=a.hold,u=a.bits,c=l,b=h,yt=A;t:for(;;)switch(a.mode){case U:if(0===a.wrap){a.mode=X;break}for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(2&a.wrap&&35615===_){a.check=0,Et[0]=255&_,Et[1]=_>>>8&255,a.check=p(a.check,Et,2,0),_=0,u=0,a.mode=D;break}if(a.flags=0,a.head&&(a.head.done=!1),!(1&a.wrap)||(((255&_)<<8)+(_>>8))%31){t.msg="incorrect header check",a.mode=ft;break}if((15&_)!==T){t.msg="unknown compression method",a.mode=ft;break}if(_>>>=4,u-=4,xt=(15&_)+8,0===a.wbits)a.wbits=xt;else if(xt>a.wbits){t.msg="invalid window size",a.mode=ft;break}a.dmax=1<<xt,t.adler=a.check=1,a.mode=512&_?Y:G,_=0,u=0;break;case D:for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(a.flags=_,(255&a.flags)!==T){t.msg="unknown compression method",a.mode=ft;break}if(57344&a.flags){t.msg="unknown header flags set",a.mode=ft;break}a.head&&(a.head.text=_>>8&1),512&a.flags&&(Et[0]=255&_,Et[1]=_>>>8&255,a.check=p(a.check,Et,2,0)),_=0,u=0,a.mode=F;case F:for(;32>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.head&&(a.head.time=_),512&a.flags&&(Et[0]=255&_,Et[1]=_>>>8&255,Et[2]=_>>>16&255,Et[3]=_>>>24&255,a.check=p(a.check,Et,4,0)),_=0,u=0,a.mode=L;case L:for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.head&&(a.head.xflags=255&_,a.head.os=_>>8),512&a.flags&&(Et[0]=255&_,Et[1]=_>>>8&255,a.check=p(a.check,Et,2,0)),_=0,u=0,a.mode=H;case H:if(1024&a.flags){for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.length=_,a.head&&(a.head.extra_len=_),512&a.flags&&(Et[0]=255&_,Et[1]=_>>>8&255,a.check=p(a.check,Et,2,0)),_=0,u=0}else a.head&&(a.head.extra=null);a.mode=j;case j:if(1024&a.flags&&(g=a.length,g>l&&(g=l),g&&(a.head&&(xt=a.head.extra_len-a.length,a.head.extra||(a.head.extra=new Array(a.head.extra_len)),m.arraySet(a.head.extra,n,s,g,xt)),512&a.flags&&(a.check=p(a.check,n,g,s)),l-=g,s+=g,a.length-=g),a.length))break t;a.length=0,a.mode=M;case M:if(2048&a.flags){if(0===l)break t;g=0;do xt=n[s+g++],a.head&&xt&&a.length<65536&&(a.head.name+=String.fromCharCode(xt));while(xt&&l>g);if(512&a.flags&&(a.check=p(a.check,n,g,s)),l-=g,s+=g,xt)break t}else a.head&&(a.head.name=null);a.length=0,a.mode=K;case K:if(4096&a.flags){if(0===l)break t;g=0;do xt=n[s+g++],a.head&&xt&&a.length<65536&&(a.head.comment+=String.fromCharCode(xt));while(xt&&l>g);if(512&a.flags&&(a.check=p(a.check,n,g,s)),l-=g,s+=g,xt)break t}else a.head&&(a.head.comment=null);a.mode=P;case P:if(512&a.flags){for(;16>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(_!==(65535&a.check)){t.msg="header crc mismatch",a.mode=ft;break}_=0,u=0}a.head&&(a.head.hcrc=a.flags>>9&1,a.head.done=!0),t.adler=a.check=0,a.mode=G;break;case Y:for(;32>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}t.adler=a.check=i(_),_=0,u=0,a.mode=q;case q:if(0===a.havedict)return t.next_out=o,t.avail_out=h,t.next_in=s,t.avail_in=l,a.hold=_,a.bits=u,R;t.adler=a.check=1,a.mode=G;case G:if(e===S||e===E)break t;case X:if(a.last){_>>>=7&u,u-=7&u,a.mode=lt;break}for(;3>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}switch(a.last=1&_,_>>>=1,u-=1,3&_){case 0:a.mode=W;break;case 1:if(d(a),a.mode=et,e===E){_>>>=2,u-=2;break t}break;case 2:a.mode=V;break;case 3:t.msg="invalid block type",a.mode=ft}_>>>=2,u-=2;break;case W:for(_>>>=7&u,u-=7&u;32>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if((65535&_)!==(_>>>16^65535)){t.msg="invalid stored block lengths",a.mode=ft;break}if(a.length=65535&_,_=0,u=0,a.mode=J,e===E)break t;case J:a.mode=Q;case Q:if(g=a.length){if(g>l&&(g=l),g>h&&(g=h),0===g)break t;m.arraySet(r,n,s,g,o),l-=g,s+=g,h-=g,o+=g,a.length-=g;break}a.mode=G;break;case V:for(;14>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(a.nlen=(31&_)+257,_>>>=5,u-=5,a.ndist=(31&_)+1,_>>>=5,u-=5,a.ncode=(15&_)+4,_>>>=4,u-=4,a.nlen>286||a.ndist>30){t.msg="too many length or distance symbols",a.mode=ft;break}a.have=0,a.mode=$;case $:for(;a.have<a.ncode;){for(;3>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.lens[At[a.have++]]=7&_,_>>>=3,u-=3}for(;a.have<19;)a.lens[At[a.have++]]=0;if(a.lencode=a.lendyn,a.lenbits=7,zt={bits:a.lenbits},yt=k(x,a.lens,0,19,a.lencode,0,a.work,zt),a.lenbits=zt.bits,yt){t.msg="invalid code lengths set",a.mode=ft;break}a.have=0,a.mode=tt;case tt:for(;a.have<a.nlen+a.ndist;){for(;St=a.lencode[_&(1<<a.lenbits)-1],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(16>wt)_>>>=gt,u-=gt,a.lens[a.have++]=wt;else{if(16===wt){for(Bt=gt+2;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(_>>>=gt,u-=gt,0===a.have){t.msg="invalid bit length repeat",a.mode=ft;break}xt=a.lens[a.have-1],g=3+(3&_),_>>>=2,u-=2}else if(17===wt){for(Bt=gt+3;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}_>>>=gt,u-=gt,xt=0,g=3+(7&_),_>>>=3,u-=3}else{for(Bt=gt+7;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}_>>>=gt,u-=gt,xt=0,g=11+(127&_),_>>>=7,u-=7}if(a.have+g>a.nlen+a.ndist){t.msg="invalid bit length repeat",a.mode=ft;break}for(;g--;)a.lens[a.have++]=xt}}if(a.mode===ft)break;if(0===a.lens[256]){t.msg="invalid code -- missing end-of-block",a.mode=ft;break}if(a.lenbits=9,zt={bits:a.lenbits},yt=k(y,a.lens,0,a.nlen,a.lencode,0,a.work,zt),
a.lenbits=zt.bits,yt){t.msg="invalid literal/lengths set",a.mode=ft;break}if(a.distbits=6,a.distcode=a.distdyn,zt={bits:a.distbits},yt=k(z,a.lens,a.nlen,a.ndist,a.distcode,0,a.work,zt),a.distbits=zt.bits,yt){t.msg="invalid distances set",a.mode=ft;break}if(a.mode=et,e===E)break t;case et:a.mode=at;case at:if(l>=6&&h>=258){t.next_out=o,t.avail_out=h,t.next_in=s,t.avail_in=l,a.hold=_,a.bits=u,v(t,b),o=t.next_out,r=t.output,h=t.avail_out,s=t.next_in,n=t.input,l=t.avail_in,_=a.hold,u=a.bits,a.mode===G&&(a.back=-1);break}for(a.back=0;St=a.lencode[_&(1<<a.lenbits)-1],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(mt&&0===(240&mt)){for(pt=gt,vt=mt,kt=wt;St=a.lencode[kt+((_&(1<<pt+vt)-1)>>pt)],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=pt+gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}_>>>=pt,u-=pt,a.back+=pt}if(_>>>=gt,u-=gt,a.back+=gt,a.length=wt,0===mt){a.mode=ot;break}if(32&mt){a.back=-1,a.mode=G;break}if(64&mt){t.msg="invalid literal/length code",a.mode=ft;break}a.extra=15&mt,a.mode=it;case it:if(a.extra){for(Bt=a.extra;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.length+=_&(1<<a.extra)-1,_>>>=a.extra,u-=a.extra,a.back+=a.extra}a.was=a.length,a.mode=nt;case nt:for(;St=a.distcode[_&(1<<a.distbits)-1],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(0===(240&mt)){for(pt=gt,vt=mt,kt=wt;St=a.distcode[kt+((_&(1<<pt+vt)-1)>>pt)],gt=St>>>24,mt=St>>>16&255,wt=65535&St,!(u>=pt+gt);){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}_>>>=pt,u-=pt,a.back+=pt}if(_>>>=gt,u-=gt,a.back+=gt,64&mt){t.msg="invalid distance code",a.mode=ft;break}a.offset=wt,a.extra=15&mt,a.mode=rt;case rt:if(a.extra){for(Bt=a.extra;Bt>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}a.offset+=_&(1<<a.extra)-1,_>>>=a.extra,u-=a.extra,a.back+=a.extra}if(a.offset>a.dmax){t.msg="invalid distance too far back",a.mode=ft;break}a.mode=st;case st:if(0===h)break t;if(g=b-h,a.offset>g){if(g=a.offset-g,g>a.whave&&a.sane){t.msg="invalid distance too far back",a.mode=ft;break}g>a.wnext?(g-=a.wnext,ct=a.wsize-g):ct=a.wnext-g,g>a.length&&(g=a.length),bt=a.window}else bt=r,ct=o-a.offset,g=a.length;g>h&&(g=h),h-=g,a.length-=g;do r[o++]=bt[ct++];while(--g);0===a.length&&(a.mode=at);break;case ot:if(0===h)break t;r[o++]=a.length,h--,a.mode=at;break;case lt:if(a.wrap){for(;32>u;){if(0===l)break t;l--,_|=n[s++]<<u,u+=8}if(b-=h,t.total_out+=b,a.total+=b,b&&(t.adler=a.check=a.flags?p(a.check,r,b,o-b):w(a.check,r,b,o-b)),b=h,(a.flags?_:i(_))!==a.check){t.msg="incorrect data check",a.mode=ft;break}_=0,u=0}a.mode=ht;case ht:if(a.wrap&&a.flags){for(;32>u;){if(0===l)break t;l--,_+=n[s++]<<u,u+=8}if(_!==(4294967295&a.total)){t.msg="incorrect length check",a.mode=ft;break}_=0,u=0}a.mode=dt;case dt:yt=Z;break t;case ft:yt=N;break t;case _t:return I;case ut:default:return C}return t.next_out=o,t.avail_out=h,t.next_in=s,t.avail_in=l,a.hold=_,a.bits=u,(a.wsize||b!==t.avail_out&&a.mode<ft&&(a.mode<lt||e!==B))&&f(t,t.output,t.next_out,b-t.avail_out)?(a.mode=_t,I):(c-=t.avail_in,b-=t.avail_out,t.total_in+=c,t.total_out+=b,a.total+=b,a.wrap&&b&&(t.adler=a.check=a.flags?p(a.check,r,b,t.next_out-b):w(a.check,r,b,t.next_out-b)),t.data_type=a.bits+(a.last?64:0)+(a.mode===G?128:0)+(a.mode===et||a.mode===J?256:0),(0===c&&0===b||e===B)&&yt===A&&(yt=O),yt)}function u(t){if(!t||!t.state)return C;var e=t.state;return e.window&&(e.window=null),t.state=null,A}function c(t,e){var a;return t&&t.state?(a=t.state,0===(2&a.wrap)?C:(a.head=e,e.done=!1,A)):C}var b,g,m=t("../utils/common"),w=t("./adler32"),p=t("./crc32"),v=t("./inffast"),k=t("./inftrees"),x=0,y=1,z=2,B=4,S=5,E=6,A=0,Z=1,R=2,C=-2,N=-3,I=-4,O=-5,T=8,U=1,D=2,F=3,L=4,H=5,j=6,M=7,K=8,P=9,Y=10,q=11,G=12,X=13,W=14,J=15,Q=16,V=17,$=18,tt=19,et=20,at=21,it=22,nt=23,rt=24,st=25,ot=26,lt=27,ht=28,dt=29,ft=30,_t=31,ut=32,ct=852,bt=592,gt=15,mt=gt,wt=!0;a.inflateReset=s,a.inflateReset2=o,a.inflateResetKeep=r,a.inflateInit=h,a.inflateInit2=l,a.inflate=_,a.inflateEnd=u,a.inflateGetHeader=c,a.inflateInfo="pako inflate (from Nodeca project)"},{"../utils/common":3,"./adler32":5,"./crc32":7,"./inffast":10,"./inftrees":12}],12:[function(t,e,a){"use strict";var i=t("../utils/common"),n=15,r=852,s=592,o=0,l=1,h=2,d=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],f=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],_=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],u=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];e.exports=function(t,e,a,c,b,g,m,w){var p,v,k,x,y,z,B,S,E,A=w.bits,Z=0,R=0,C=0,N=0,I=0,O=0,T=0,U=0,D=0,F=0,L=null,H=0,j=new i.Buf16(n+1),M=new i.Buf16(n+1),K=null,P=0;for(Z=0;n>=Z;Z++)j[Z]=0;for(R=0;c>R;R++)j[e[a+R]]++;for(I=A,N=n;N>=1&&0===j[N];N--);if(I>N&&(I=N),0===N)return b[g++]=20971520,b[g++]=20971520,w.bits=1,0;for(C=1;N>C&&0===j[C];C++);for(C>I&&(I=C),U=1,Z=1;n>=Z;Z++)if(U<<=1,U-=j[Z],0>U)return-1;if(U>0&&(t===o||1!==N))return-1;for(M[1]=0,Z=1;n>Z;Z++)M[Z+1]=M[Z]+j[Z];for(R=0;c>R;R++)0!==e[a+R]&&(m[M[e[a+R]]++]=R);if(t===o?(L=K=m,z=19):t===l?(L=d,H-=257,K=f,P-=257,z=256):(L=_,K=u,z=-1),F=0,R=0,Z=C,y=g,O=I,T=0,k=-1,D=1<<I,x=D-1,t===l&&D>r||t===h&&D>s)return 1;for(var Y=0;;){Y++,B=Z-T,m[R]<z?(S=0,E=m[R]):m[R]>z?(S=K[P+m[R]],E=L[H+m[R]]):(S=96,E=0),p=1<<Z-T,v=1<<O,C=v;do v-=p,b[y+(F>>T)+v]=B<<24|S<<16|E|0;while(0!==v);for(p=1<<Z-1;F&p;)p>>=1;if(0!==p?(F&=p-1,F+=p):F=0,R++,0===--j[Z]){if(Z===N)break;Z=e[a+m[R]]}if(Z>I&&(F&x)!==k){for(0===T&&(T=I),y+=C,O=Z-T,U=1<<O;N>O+T&&(U-=j[O+T],!(0>=U));)O++,U<<=1;if(D+=1<<O,t===l&&D>r||t===h&&D>s)return 1;k=F&x,b[k]=I<<24|O<<16|y-g|0}}return 0!==F&&(b[y+F]=Z-T<<24|64<<16|0),w.bits=I,0}},{"../utils/common":3}],13:[function(t,e,a){"use strict";e.exports={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"}},{}],14:[function(t,e,a){"use strict";function i(t){for(var e=t.length;--e>=0;)t[e]=0}function n(t){return 256>t?st[t]:st[256+(t>>>7)]}function r(t,e){t.pending_buf[t.pending++]=255&e,t.pending_buf[t.pending++]=e>>>8&255}function s(t,e,a){t.bi_valid>G-a?(t.bi_buf|=e<<t.bi_valid&65535,r(t,t.bi_buf),t.bi_buf=e>>G-t.bi_valid,t.bi_valid+=a-G):(t.bi_buf|=e<<t.bi_valid&65535,t.bi_valid+=a)}function o(t,e,a){s(t,a[2*e],a[2*e+1])}function l(t,e){var a=0;do a|=1&t,t>>>=1,a<<=1;while(--e>0);return a>>>1}function h(t){16===t.bi_valid?(r(t,t.bi_buf),t.bi_buf=0,t.bi_valid=0):t.bi_valid>=8&&(t.pending_buf[t.pending++]=255&t.bi_buf,t.bi_buf>>=8,t.bi_valid-=8)}function d(t,e){var a,i,n,r,s,o,l=e.dyn_tree,h=e.max_code,d=e.stat_desc.static_tree,f=e.stat_desc.has_stree,_=e.stat_desc.extra_bits,u=e.stat_desc.extra_base,c=e.stat_desc.max_length,b=0;for(r=0;q>=r;r++)t.bl_count[r]=0;for(l[2*t.heap[t.heap_max]+1]=0,a=t.heap_max+1;Y>a;a++)i=t.heap[a],r=l[2*l[2*i+1]+1]+1,r>c&&(r=c,b++),l[2*i+1]=r,i>h||(t.bl_count[r]++,s=0,i>=u&&(s=_[i-u]),o=l[2*i],t.opt_len+=o*(r+s),f&&(t.static_len+=o*(d[2*i+1]+s)));if(0!==b){do{for(r=c-1;0===t.bl_count[r];)r--;t.bl_count[r]--,t.bl_count[r+1]+=2,t.bl_count[c]--,b-=2}while(b>0);for(r=c;0!==r;r--)for(i=t.bl_count[r];0!==i;)n=t.heap[--a],n>h||(l[2*n+1]!==r&&(t.opt_len+=(r-l[2*n+1])*l[2*n],l[2*n+1]=r),i--)}}function f(t,e,a){var i,n,r=new Array(q+1),s=0;for(i=1;q>=i;i++)r[i]=s=s+a[i-1]<<1;for(n=0;e>=n;n++){var o=t[2*n+1];0!==o&&(t[2*n]=l(r[o]++,o))}}function _(){var t,e,a,i,n,r=new Array(q+1);for(a=0,i=0;H-1>i;i++)for(lt[i]=a,t=0;t<1<<$[i];t++)ot[a++]=i;for(ot[a-1]=i,n=0,i=0;16>i;i++)for(ht[i]=n,t=0;t<1<<tt[i];t++)st[n++]=i;for(n>>=7;K>i;i++)for(ht[i]=n<<7,t=0;t<1<<tt[i]-7;t++)st[256+n++]=i;for(e=0;q>=e;e++)r[e]=0;for(t=0;143>=t;)nt[2*t+1]=8,t++,r[8]++;for(;255>=t;)nt[2*t+1]=9,t++,r[9]++;for(;279>=t;)nt[2*t+1]=7,t++,r[7]++;for(;287>=t;)nt[2*t+1]=8,t++,r[8]++;for(f(nt,M+1,r),t=0;K>t;t++)rt[2*t+1]=5,rt[2*t]=l(t,5);dt=new ut(nt,$,j+1,M,q),ft=new ut(rt,tt,0,K,q),_t=new ut(new Array(0),et,0,P,X)}function u(t){var e;for(e=0;M>e;e++)t.dyn_ltree[2*e]=0;for(e=0;K>e;e++)t.dyn_dtree[2*e]=0;for(e=0;P>e;e++)t.bl_tree[2*e]=0;t.dyn_ltree[2*W]=1,t.opt_len=t.static_len=0,t.last_lit=t.matches=0}function c(t){t.bi_valid>8?r(t,t.bi_buf):t.bi_valid>0&&(t.pending_buf[t.pending++]=t.bi_buf),t.bi_buf=0,t.bi_valid=0}function b(t,e,a,i){c(t),i&&(r(t,a),r(t,~a)),R.arraySet(t.pending_buf,t.window,e,a,t.pending),t.pending+=a}function g(t,e,a,i){var n=2*e,r=2*a;return t[n]<t[r]||t[n]===t[r]&&i[e]<=i[a]}function m(t,e,a){for(var i=t.heap[a],n=a<<1;n<=t.heap_len&&(n<t.heap_len&&g(e,t.heap[n+1],t.heap[n],t.depth)&&n++,!g(e,i,t.heap[n],t.depth));)t.heap[a]=t.heap[n],a=n,n<<=1;t.heap[a]=i}function w(t,e,a){var i,r,l,h,d=0;if(0!==t.last_lit)do i=t.pending_buf[t.d_buf+2*d]<<8|t.pending_buf[t.d_buf+2*d+1],r=t.pending_buf[t.l_buf+d],d++,0===i?o(t,r,e):(l=ot[r],o(t,l+j+1,e),h=$[l],0!==h&&(r-=lt[l],s(t,r,h)),i--,l=n(i),o(t,l,a),h=tt[l],0!==h&&(i-=ht[l],s(t,i,h)));while(d<t.last_lit);o(t,W,e)}function p(t,e){var a,i,n,r=e.dyn_tree,s=e.stat_desc.static_tree,o=e.stat_desc.has_stree,l=e.stat_desc.elems,h=-1;for(t.heap_len=0,t.heap_max=Y,a=0;l>a;a++)0!==r[2*a]?(t.heap[++t.heap_len]=h=a,t.depth[a]=0):r[2*a+1]=0;for(;t.heap_len<2;)n=t.heap[++t.heap_len]=2>h?++h:0,r[2*n]=1,t.depth[n]=0,t.opt_len--,o&&(t.static_len-=s[2*n+1]);for(e.max_code=h,a=t.heap_len>>1;a>=1;a--)m(t,r,a);n=l;do a=t.heap[1],t.heap[1]=t.heap[t.heap_len--],m(t,r,1),i=t.heap[1],t.heap[--t.heap_max]=a,t.heap[--t.heap_max]=i,r[2*n]=r[2*a]+r[2*i],t.depth[n]=(t.depth[a]>=t.depth[i]?t.depth[a]:t.depth[i])+1,r[2*a+1]=r[2*i+1]=n,t.heap[1]=n++,m(t,r,1);while(t.heap_len>=2);t.heap[--t.heap_max]=t.heap[1],d(t,e),f(r,h,t.bl_count)}function v(t,e,a){var i,n,r=-1,s=e[1],o=0,l=7,h=4;for(0===s&&(l=138,h=3),e[2*(a+1)+1]=65535,i=0;a>=i;i++)n=s,s=e[2*(i+1)+1],++o<l&&n===s||(h>o?t.bl_tree[2*n]+=o:0!==n?(n!==r&&t.bl_tree[2*n]++,t.bl_tree[2*J]++):10>=o?t.bl_tree[2*Q]++:t.bl_tree[2*V]++,o=0,r=n,0===s?(l=138,h=3):n===s?(l=6,h=3):(l=7,h=4))}function k(t,e,a){var i,n,r=-1,l=e[1],h=0,d=7,f=4;for(0===l&&(d=138,f=3),i=0;a>=i;i++)if(n=l,l=e[2*(i+1)+1],!(++h<d&&n===l)){if(f>h){do o(t,n,t.bl_tree);while(0!==--h)}else 0!==n?(n!==r&&(o(t,n,t.bl_tree),h--),o(t,J,t.bl_tree),s(t,h-3,2)):10>=h?(o(t,Q,t.bl_tree),s(t,h-3,3)):(o(t,V,t.bl_tree),s(t,h-11,7));h=0,r=n,0===l?(d=138,f=3):n===l?(d=6,f=3):(d=7,f=4)}}function x(t){var e;for(v(t,t.dyn_ltree,t.l_desc.max_code),v(t,t.dyn_dtree,t.d_desc.max_code),p(t,t.bl_desc),e=P-1;e>=3&&0===t.bl_tree[2*at[e]+1];e--);return t.opt_len+=3*(e+1)+5+5+4,e}function y(t,e,a,i){var n;for(s(t,e-257,5),s(t,a-1,5),s(t,i-4,4),n=0;i>n;n++)s(t,t.bl_tree[2*at[n]+1],3);k(t,t.dyn_ltree,e-1),k(t,t.dyn_dtree,a-1)}function z(t){var e,a=4093624447;for(e=0;31>=e;e++,a>>>=1)if(1&a&&0!==t.dyn_ltree[2*e])return N;if(0!==t.dyn_ltree[18]||0!==t.dyn_ltree[20]||0!==t.dyn_ltree[26])return I;for(e=32;j>e;e++)if(0!==t.dyn_ltree[2*e])return I;return N}function B(t){bt||(_(),bt=!0),t.l_desc=new ct(t.dyn_ltree,dt),t.d_desc=new ct(t.dyn_dtree,ft),t.bl_desc=new ct(t.bl_tree,_t),t.bi_buf=0,t.bi_valid=0,u(t)}function S(t,e,a,i){s(t,(T<<1)+(i?1:0),3),b(t,e,a,!0)}function E(t){s(t,U<<1,3),o(t,W,nt),h(t)}function A(t,e,a,i){var n,r,o=0;t.level>0?(t.strm.data_type===O&&(t.strm.data_type=z(t)),p(t,t.l_desc),p(t,t.d_desc),o=x(t),n=t.opt_len+3+7>>>3,r=t.static_len+3+7>>>3,n>=r&&(n=r)):n=r=a+5,n>=a+4&&-1!==e?S(t,e,a,i):t.strategy===C||r===n?(s(t,(U<<1)+(i?1:0),3),w(t,nt,rt)):(s(t,(D<<1)+(i?1:0),3),y(t,t.l_desc.max_code+1,t.d_desc.max_code+1,o+1),w(t,t.dyn_ltree,t.dyn_dtree)),u(t),i&&c(t)}function Z(t,e,a){return t.pending_buf[t.d_buf+2*t.last_lit]=e>>>8&255,t.pending_buf[t.d_buf+2*t.last_lit+1]=255&e,t.pending_buf[t.l_buf+t.last_lit]=255&a,t.last_lit++,0===e?t.dyn_ltree[2*a]++:(t.matches++,e--,t.dyn_ltree[2*(ot[a]+j+1)]++,t.dyn_dtree[2*n(e)]++),t.last_lit===t.lit_bufsize-1}var R=t("../utils/common"),C=4,N=0,I=1,O=2,T=0,U=1,D=2,F=3,L=258,H=29,j=256,M=j+1+H,K=30,P=19,Y=2*M+1,q=15,G=16,X=7,W=256,J=16,Q=17,V=18,$=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],tt=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],et=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],at=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],it=512,nt=new Array(2*(M+2));i(nt);var rt=new Array(2*K);i(rt);var st=new Array(it);i(st);var ot=new Array(L-F+1);i(ot);var lt=new Array(H);i(lt);var ht=new Array(K);i(ht);var dt,ft,_t,ut=function(t,e,a,i,n){this.static_tree=t,this.extra_bits=e,this.extra_base=a,this.elems=i,this.max_length=n,this.has_stree=t&&t.length},ct=function(t,e){this.dyn_tree=t,this.max_code=0,this.stat_desc=e},bt=!1;a._tr_init=B,a._tr_stored_block=S,a._tr_flush_block=A,a._tr_tally=Z,a._tr_align=E},{"../utils/common":3}],15:[function(t,e,a){"use strict";function i(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}e.exports=i},{}],"/":[function(t,e,a){"use strict";var i=t("./lib/utils/common").assign,n=t("./lib/deflate"),r=t("./lib/inflate"),s=t("./lib/zlib/constants"),o={};i(o,n,r,s),e.exports=o},{"./lib/deflate":1,"./lib/inflate":2,"./lib/utils/common":3,"./lib/zlib/constants":6}]},{},[])("/")});

;(function(){
/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
            ;
var h, aa = this || self;
function ba(a) {
  var b = typeof a;
  return "object" != b ? b : a ? Array.isArray(a) ? "array" : b : "null";
}
function ca(a) {
  return Object.prototype.hasOwnProperty.call(a, ha) && a[ha] || (a[ha] = ++ja);
}
var ha = "closure_uid_" + (1e9 * Math.random() >>> 0), ja = 0;
function la(a, b) {
  a = a.split(".");
  var c = aa;
  a[0] in c || "undefined" == typeof c.execScript || c.execScript("var " + a[0]);
  for (var d; a.length && (d = a.shift());) {
    a.length || void 0 === b ? c = c[d] && c[d] !== Object.prototype[d] ? c[d] : c[d] = {} : c[d] = b;
  }
}
;function ma(a) {
  var b = a.length;
  if (0 < b) {
    for (var c = Array(b), d = 0; d < b; d++) {
      c[d] = a[d];
    }
    return c;
  }
  return [];
}
function na(a, b) {
  a.sort(b || oa);
}
function qa(a, b) {
  for (var c = Array(a.length), d = 0; d < a.length; d++) {
    c[d] = {index:d, value:a[d]};
  }
  var e = b || oa;
  na(c, function(f, g) {
    return e(f.value, g.value) || f.index - g.index;
  });
  for (d = 0; d < a.length; d++) {
    a[d] = c[d].value;
  }
}
function oa(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}
;function ra(a) {
  const b = [];
  let c = 0;
  for (const d in a) {
    b[c++] = d;
  }
  return b;
}
;function sa(a, b) {
  return 0 == a.lastIndexOf(b, 0);
}
var ua = String.prototype.trim ? function(a) {
  return a.trim();
} : function(a) {
  return /^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1];
};
(class {
  constructor(a, b) {
    this.Cc = b === wa ? a : "";
  }
}).prototype.toString = function() {
  return "SafeStyle{" + this.Cc + "}";
};
var wa = {};
function xa(a, b) {
  null != a && this.append.apply(this, arguments);
}
h = xa.prototype;
h.hb = "";
h.set = function(a) {
  this.hb = "" + a;
};
h.append = function(a, b, c) {
  this.hb += String(a);
  if (null != b) {
    for (let d = 1; d < arguments.length; d++) {
      this.hb += arguments[d];
    }
  }
  return this;
};
h.clear = function() {
  this.hb = "";
};
h.toString = function() {
  return this.hb;
};
var ya = {}, Aa = {}, Ba;
if ("undefined" === typeof ya || "undefined" === typeof Aa || "undefined" === typeof p) {
  var p = {};
}
if ("undefined" === typeof ya || "undefined" === typeof Aa || "undefined" === typeof Ca) {
  var Ca = null;
}
if ("undefined" === typeof ya || "undefined" === typeof Aa || "undefined" === typeof Ea) {
  var Ea = null;
}
var Fa = !0, Ga = null;
if ("undefined" === typeof ya || "undefined" === typeof Aa || "undefined" === typeof Ha) {
  var Ha = null;
}
function Ja() {
  return new r(null, 5, [Ka, !0, Ma, !0, Na, !1, Oa, !1, Pa, null], null);
}
function t(a) {
  return null != a && !1 !== a;
}
function Qa(a) {
  return null == a;
}
function Ra(a) {
  return a instanceof Array;
}
function Ta(a) {
  return null == a ? !0 : !1 === a ? !0 : !1;
}
function Ua(a, b) {
  return a[ba(null == b ? null : b)] ? !0 : a._ ? !0 : !1;
}
function Va(a) {
  return null == a ? null : a.constructor;
}
function Wa(a, b) {
  var c = Va(b);
  return Error(["No protocol method ", a, " defined for type ", t(t(c) ? c.Zb : c) ? c.Lb : ba(b), ": ", b].join(""));
}
function Xa(a) {
  var b = a.Lb;
  return t(b) ? b : u.h(a);
}
var Ya = "undefined" !== typeof Symbol && "function" === ba(Symbol) ? Symbol.iterator : "@@iterator";
function Za(a) {
  for (var b = a.length, c = Array(b), d = 0;;) {
    if (d < b) {
      c[d] = a[d], d += 1;
    } else {
      break;
    }
  }
  return c;
}
function $a(a) {
  return ab(function(b, c) {
    b.push(c);
    return b;
  }, [], a);
}
function bb() {
}
function db() {
}
function eb(a) {
  if (null != a && null != a.N) {
    a = a.N(a);
  } else {
    var b = eb[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = eb._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("ICounted.-count", a);
      }
    }
  }
  return a;
}
function fb() {
}
function gb(a) {
  if (null != a && null != a.$) {
    a = a.$(a);
  } else {
    var b = gb[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = gb._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IEmptyableCollection.-empty", a);
      }
    }
  }
  return a;
}
function hb() {
}
function ib(a, b) {
  if (null != a && null != a.Y) {
    a = a.Y(a, b);
  } else {
    var c = ib[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = ib._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("ICollection.-conj", a);
      }
    }
  }
  return a;
}
function jb() {
}
var lb = function() {
  function a(d, e, f) {
    var g = kb[ba(null == d ? null : d)];
    if (null != g) {
      return g.i ? g.i(d, e, f) : g.call(null, d, e, f);
    }
    g = kb._;
    if (null != g) {
      return g.i ? g.i(d, e, f) : g.call(null, d, e, f);
    }
    throw Wa("IIndexed.-nth", d);
  }
  function b(d, e) {
    var f = kb[ba(null == d ? null : d)];
    if (null != f) {
      return f.g ? f.g(d, e) : f.call(null, d, e);
    }
    f = kb._;
    if (null != f) {
      return f.g ? f.g(d, e) : f.call(null, d, e);
    }
    throw Wa("IIndexed.-nth", d);
  }
  var c = null;
  c = function(d, e, f) {
    switch(arguments.length) {
      case 2:
        return b.call(this, d, e);
      case 3:
        return a.call(this, d, e, f);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  c.g = b;
  c.i = a;
  return c;
}(), kb = function kb(a) {
  switch(arguments.length) {
    case 2:
      return kb.g(arguments[0], arguments[1]);
    case 3:
      return kb.i(arguments[0], arguments[1], arguments[2]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
kb.g = function(a, b) {
  return null != a && null != a.M ? a.M(a, b) : lb.g(a, b);
};
kb.i = function(a, b, c) {
  return null != a && null != a.aa ? a.aa(a, b, c) : lb.i(a, b, c);
};
kb.C = 3;
function mb() {
}
function nb(a) {
  if (null != a && null != a.ha) {
    a = a.ha(a);
  } else {
    var b = nb[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = nb._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("ISeq.-first", a);
      }
    }
  }
  return a;
}
function ob(a) {
  if (null != a && null != a.ja) {
    a = a.ja(a);
  } else {
    var b = ob[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = ob._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("ISeq.-rest", a);
      }
    }
  }
  return a;
}
function pb() {
}
function qb() {
}
var sb = function() {
  function a(d, e, f) {
    var g = rb[ba(null == d ? null : d)];
    if (null != g) {
      return g.i ? g.i(d, e, f) : g.call(null, d, e, f);
    }
    g = rb._;
    if (null != g) {
      return g.i ? g.i(d, e, f) : g.call(null, d, e, f);
    }
    throw Wa("ILookup.-lookup", d);
  }
  function b(d, e) {
    var f = rb[ba(null == d ? null : d)];
    if (null != f) {
      return f.g ? f.g(d, e) : f.call(null, d, e);
    }
    f = rb._;
    if (null != f) {
      return f.g ? f.g(d, e) : f.call(null, d, e);
    }
    throw Wa("ILookup.-lookup", d);
  }
  var c = null;
  c = function(d, e, f) {
    switch(arguments.length) {
      case 2:
        return b.call(this, d, e);
      case 3:
        return a.call(this, d, e, f);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  c.g = b;
  c.i = a;
  return c;
}(), rb = function rb(a) {
  switch(arguments.length) {
    case 2:
      return rb.g(arguments[0], arguments[1]);
    case 3:
      return rb.i(arguments[0], arguments[1], arguments[2]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
rb.g = function(a, b) {
  return null != a && null != a.T ? a.T(a, b) : sb.g(a, b);
};
rb.i = function(a, b, c) {
  return null != a && null != a.H ? a.H(a, b, c) : sb.i(a, b, c);
};
rb.C = 3;
function tb() {
}
function ub(a, b) {
  if (null != a && null != a.ab) {
    a = a.ab(a, b);
  } else {
    var c = ub[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = ub._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("IAssociative.-contains-key?", a);
      }
    }
  }
  return a;
}
function vb(a, b, c) {
  if (null != a && null != a.Ba) {
    a = a.Ba(a, b, c);
  } else {
    var d = vb[ba(null == a ? null : a)];
    if (null != d) {
      a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
    } else {
      if (d = vb._, null != d) {
        a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
      } else {
        throw Wa("IAssociative.-assoc", a);
      }
    }
  }
  return a;
}
function xb(a, b) {
  if (null != a && null != a.ob) {
    a = a.ob(a, b);
  } else {
    var c = xb[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = xb._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("IFind.-find", a);
      }
    }
  }
  return a;
}
function yb() {
}
function zb(a) {
  if (null != a && null != a.oc) {
    a = a.key;
  } else {
    var b = zb[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = zb._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IMapEntry.-key", a);
      }
    }
  }
  return a;
}
function Ab(a) {
  if (null != a && null != a.pc) {
    a = a.I;
  } else {
    var b = Ab[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = Ab._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IMapEntry.-val", a);
      }
    }
  }
  return a;
}
function Bb() {
}
function Cb(a) {
  if (null != a && null != a.rb) {
    a = a.rb(a);
  } else {
    var b = Cb[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = Cb._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IStack.-peek", a);
      }
    }
  }
  return a;
}
function Db(a) {
  if (null != a && null != a.sb) {
    a = a.sb(a);
  } else {
    var b = Db[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = Db._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IStack.-pop", a);
      }
    }
  }
  return a;
}
function Eb() {
}
function Fb(a, b, c) {
  if (null != a && null != a.jb) {
    a = a.jb(a, b, c);
  } else {
    var d = Fb[ba(null == a ? null : a)];
    if (null != d) {
      a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
    } else {
      if (d = Fb._, null != d) {
        a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
      } else {
        throw Wa("IVector.-assoc-n", a);
      }
    }
  }
  return a;
}
function Gb(a) {
  if (null != a && null != a.Rb) {
    a = a.Rb(a);
  } else {
    var b = Gb[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = Gb._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IDeref.-deref", a);
      }
    }
  }
  return a;
}
function Hb() {
}
function Ib(a) {
  if (null != a && null != a.U) {
    a = a.U(a);
  } else {
    var b = Ib[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = Ib._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IMeta.-meta", a);
      }
    }
  }
  return a;
}
function Jb(a, b) {
  if (null != a && null != a.V) {
    a = a.V(a, b);
  } else {
    var c = Jb[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = Jb._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("IWithMeta.-with-meta", a);
      }
    }
  }
  return a;
}
function Kb() {
}
var Mb = function() {
  function a(d, e, f) {
    var g = Lb[ba(null == d ? null : d)];
    if (null != g) {
      return g.i ? g.i(d, e, f) : g.call(null, d, e, f);
    }
    g = Lb._;
    if (null != g) {
      return g.i ? g.i(d, e, f) : g.call(null, d, e, f);
    }
    throw Wa("IReduce.-reduce", d);
  }
  function b(d, e) {
    var f = Lb[ba(null == d ? null : d)];
    if (null != f) {
      return f.g ? f.g(d, e) : f.call(null, d, e);
    }
    f = Lb._;
    if (null != f) {
      return f.g ? f.g(d, e) : f.call(null, d, e);
    }
    throw Wa("IReduce.-reduce", d);
  }
  var c = null;
  c = function(d, e, f) {
    switch(arguments.length) {
      case 2:
        return b.call(this, d, e);
      case 3:
        return a.call(this, d, e, f);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  c.g = b;
  c.i = a;
  return c;
}(), Lb = function Lb(a) {
  switch(arguments.length) {
    case 2:
      return Lb.g(arguments[0], arguments[1]);
    case 3:
      return Lb.i(arguments[0], arguments[1], arguments[2]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
Lb.g = function(a, b) {
  return null != a && null != a.fa ? a.fa(a, b) : Mb.g(a, b);
};
Lb.i = function(a, b, c) {
  return null != a && null != a.ga ? a.ga(a, b, c) : Mb.i(a, b, c);
};
Lb.C = 3;
function Nb() {
}
function Ob(a, b, c) {
  if (null != a && null != a.pb) {
    a = a.pb(a, b, c);
  } else {
    var d = Ob[ba(null == a ? null : a)];
    if (null != d) {
      a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
    } else {
      if (d = Ob._, null != d) {
        a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
      } else {
        throw Wa("IKVReduce.-kv-reduce", a);
      }
    }
  }
  return a;
}
function Pb(a, b) {
  if (null != a && null != a.D) {
    a = a.D(a, b);
  } else {
    var c = Pb[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = Pb._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("IEquiv.-equiv", a);
      }
    }
  }
  return a;
}
function Qb(a) {
  if (null != a && null != a.S) {
    a = a.S(a);
  } else {
    var b = Qb[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = Qb._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IHash.-hash", a);
      }
    }
  }
  return a;
}
function Rb() {
}
function Sb(a) {
  if (null != a && null != a.P) {
    a = a.P(a);
  } else {
    var b = Sb[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = Sb._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("ISeqable.-seq", a);
      }
    }
  }
  return a;
}
function Tb() {
}
function Ub() {
}
function Vb() {
}
function Wb() {
}
function Xb(a) {
  if (null != a && null != a.Ab) {
    a = a.Ab(a);
  } else {
    var b = Xb[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = Xb._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IReversible.-rseq", a);
      }
    }
  }
  return a;
}
function Yb(a, b) {
  if (null != a && null != a.Yb) {
    a = a.Yb(a, b);
  } else {
    var c = Yb[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = Yb._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("IWriter.-write", a);
      }
    }
  }
  return a;
}
function Zb() {
}
function $b(a, b, c) {
  if (null != a && null != a.O) {
    a = a.O(a, b, c);
  } else {
    var d = $b[ba(null == a ? null : a)];
    if (null != d) {
      a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
    } else {
      if (d = $b._, null != d) {
        a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
      } else {
        throw Wa("IPrintWithWriter.-pr-writer", a);
      }
    }
  }
  return a;
}
function ac(a) {
  if (null != a && null != a.nb) {
    a = a.nb(a);
  } else {
    var b = ac[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = ac._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IEditableCollection.-as-transient", a);
      }
    }
  }
  return a;
}
function bc(a, b) {
  if (null != a && null != a.ub) {
    a = a.ub(a, b);
  } else {
    var c = bc[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = bc._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("ITransientCollection.-conj!", a);
      }
    }
  }
  return a;
}
function cc(a) {
  if (null != a && null != a.Bb) {
    a = a.Bb(a);
  } else {
    var b = cc[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = cc._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("ITransientCollection.-persistent!", a);
      }
    }
  }
  return a;
}
function dc(a, b, c) {
  if (null != a && null != a.tb) {
    a = a.tb(a, b, c);
  } else {
    var d = dc[ba(null == a ? null : a)];
    if (null != d) {
      a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
    } else {
      if (d = dc._, null != d) {
        a = d.i ? d.i(a, b, c) : d.call(null, a, b, c);
      } else {
        throw Wa("ITransientAssociative.-assoc!", a);
      }
    }
  }
  return a;
}
function fc() {
}
function gc(a, b) {
  if (null != a && null != a.ib) {
    a = a.ib(a, b);
  } else {
    var c = gc[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = gc._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("IComparable.-compare", a);
      }
    }
  }
  return a;
}
function hc(a) {
  if (null != a && null != a.Qb) {
    a = a.Qb(a);
  } else {
    var b = hc[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = hc._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IChunk.-drop-first", a);
      }
    }
  }
  return a;
}
function ic(a) {
  if (null != a && null != a.yb) {
    a = a.yb(a);
  } else {
    var b = ic[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = ic._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IChunkedSeq.-chunked-first", a);
      }
    }
  }
  return a;
}
function jc(a) {
  if (null != a && null != a.bb) {
    a = a.bb(a);
  } else {
    var b = jc[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = jc._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IChunkedSeq.-chunked-rest", a);
      }
    }
  }
  return a;
}
function kc(a, b) {
  if (null != a && null != a.tc) {
    a = a.tc(a, b);
  } else {
    var c = kc[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = kc._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("IReset.-reset!", a);
      }
    }
  }
  return a;
}
var mc = function() {
  function a(f, g, k, l, m) {
    var n = lc[ba(null == f ? null : f)];
    if (null != n) {
      return n.ea ? n.ea(f, g, k, l, m) : n.call(null, f, g, k, l, m);
    }
    n = lc._;
    if (null != n) {
      return n.ea ? n.ea(f, g, k, l, m) : n.call(null, f, g, k, l, m);
    }
    throw Wa("ISwap.-swap!", f);
  }
  function b(f, g, k, l) {
    var m = lc[ba(null == f ? null : f)];
    if (null != m) {
      return m.L ? m.L(f, g, k, l) : m.call(null, f, g, k, l);
    }
    m = lc._;
    if (null != m) {
      return m.L ? m.L(f, g, k, l) : m.call(null, f, g, k, l);
    }
    throw Wa("ISwap.-swap!", f);
  }
  function c(f, g, k) {
    var l = lc[ba(null == f ? null : f)];
    if (null != l) {
      return l.i ? l.i(f, g, k) : l.call(null, f, g, k);
    }
    l = lc._;
    if (null != l) {
      return l.i ? l.i(f, g, k) : l.call(null, f, g, k);
    }
    throw Wa("ISwap.-swap!", f);
  }
  function d(f, g) {
    var k = lc[ba(null == f ? null : f)];
    if (null != k) {
      return k.g ? k.g(f, g) : k.call(null, f, g);
    }
    k = lc._;
    if (null != k) {
      return k.g ? k.g(f, g) : k.call(null, f, g);
    }
    throw Wa("ISwap.-swap!", f);
  }
  var e = null;
  e = function(f, g, k, l, m) {
    switch(arguments.length) {
      case 2:
        return d.call(this, f, g);
      case 3:
        return c.call(this, f, g, k);
      case 4:
        return b.call(this, f, g, k, l);
      case 5:
        return a.call(this, f, g, k, l, m);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  e.g = d;
  e.i = c;
  e.L = b;
  e.ea = a;
  return e;
}(), lc = function lc(a) {
  switch(arguments.length) {
    case 2:
      return lc.g(arguments[0], arguments[1]);
    case 3:
      return lc.i(arguments[0], arguments[1], arguments[2]);
    case 4:
      return lc.L(arguments[0], arguments[1], arguments[2], arguments[3]);
    case 5:
      return lc.ea(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
lc.g = function(a, b) {
  return null != a && null != a.vc ? a.vc(a, b) : mc.g(a, b);
};
lc.i = function(a, b, c) {
  return null != a && null != a.wc ? a.wc(a, b, c) : mc.i(a, b, c);
};
lc.L = function(a, b, c, d) {
  return null != a && null != a.xc ? a.xc(a, b, c, d) : mc.L(a, b, c, d);
};
lc.ea = function(a, b, c, d, e) {
  return null != a && null != a.yc ? a.yc(a, b, c, d, e) : mc.ea(a, b, c, d, e);
};
lc.C = 5;
function nc() {
}
function oc(a) {
  if (null != a && null != a.za) {
    a = a.za(a);
  } else {
    var b = oc[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = oc._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IIterable.-iterator", a);
      }
    }
  }
  return a;
}
function pc(a) {
  this.Ec = a;
  this.o = 1073741824;
  this.G = 0;
}
pc.prototype.Yb = function(a, b) {
  return this.Ec.append(b);
};
function qc(a) {
  var b = new xa;
  a.O(null, new pc(b), Ja());
  return u.h(b);
}
var rc = "undefined" !== typeof Math && "undefined" !== typeof Math.imul && 0 !== Math.imul(4294967295, 5) ? function(a, b) {
  return Math.imul(a, b);
} : function(a, b) {
  var c = a & 65535, d = b & 65535;
  return c * d + ((a >>> 16 & 65535) * d + c * (b >>> 16 & 65535) << 16 >>> 0) | 0;
};
function sc(a) {
  a = rc(a | 0, -862048943);
  return rc(a << 15 | a >>> -15, 461845907);
}
function tc(a, b) {
  a = (a | 0) ^ (b | 0);
  return rc(a << 13 | a >>> -13, 5) + -430675100 | 0;
}
function uc(a, b) {
  a = (a | 0) ^ b;
  a = rc(a ^ a >>> 16, -2048144789);
  a = rc(a ^ a >>> 13, -1028477387);
  return a ^ a >>> 16;
}
function vc(a) {
  a: {
    var b = 1;
    for (var c = 0;;) {
      if (b < a.length) {
        var d = b + 2;
        c = tc(c, sc(a.charCodeAt(b - 1) | a.charCodeAt(b) << 16));
        b = d;
      } else {
        b = c;
        break a;
      }
    }
  }
  b = 1 === (a.length & 1) ? b ^ sc(a.charCodeAt(a.length - 1)) : b;
  return uc(b, rc(2, a.length));
}
var wc = {}, xc = 0;
function yc(a) {
  255 < xc && (wc = {}, xc = 0);
  if (null == a) {
    return 0;
  }
  var b = wc[a];
  if ("number" === typeof b) {
    a = b;
  } else {
    a: {
      if (null != a) {
        if (b = a.length, 0 < b) {
          for (var c = 0, d = 0;;) {
            if (c < b) {
              var e = c + 1;
              d = rc(31, d) + a.charCodeAt(c);
              c = e;
            } else {
              b = d;
              break a;
            }
          }
        } else {
          b = 0;
        }
      } else {
        b = 0;
      }
    }
    wc[a] = b;
    xc += 1;
    a = b;
  }
  return a;
}
function zc(a) {
  if (null != a && (a.o & 4194304 || p === a.Jc)) {
    return a.S(null) ^ 0;
  }
  if ("number" === typeof a) {
    if (t(isFinite(a))) {
      return Math.floor(a) % 2147483647;
    }
    switch(a) {
      case Infinity:
        return 2146435072;
      case -Infinity:
        return -1048576;
      default:
        return 2146959360;
    }
  } else {
    return !0 === a ? a = 1231 : !1 === a ? a = 1237 : "string" === typeof a ? (a = yc(a), 0 !== a && (a = sc(a), a = tc(0, a), a = uc(a, 4))) : a = a instanceof Date ? a.valueOf() ^ 0 : null == a ? 0 : Qb(a) ^ 0, a;
  }
}
function Ac(a, b) {
  return a ^ b + 2654435769 + (a << 6) + (a >> 2);
}
function Bc(a, b) {
  if (a.Ja === b.Ja) {
    return 0;
  }
  var c = Ta(a.wa);
  if (t(c ? b.wa : c)) {
    return -1;
  }
  if (t(a.wa)) {
    if (Ta(b.wa)) {
      return 1;
    }
    c = oa(a.wa, b.wa);
    return 0 === c ? oa(a.name, b.name) : c;
  }
  return oa(a.name, b.name);
}
function Cc(a, b, c, d, e) {
  this.wa = a;
  this.name = b;
  this.Ja = c;
  this.lb = d;
  this.Ia = e;
  this.o = 2154168321;
  this.G = 4096;
}
h = Cc.prototype;
h.toString = function() {
  return this.Ja;
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.D = function(a, b) {
  return b instanceof Cc ? this.Ja === b.Ja : !1;
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return w.g(c, this);
      case 3:
        return w.i(c, this, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return w.g(c, this);
  };
  a.i = function(b, c, d) {
    return w.i(c, this, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return w.g(a, this);
};
h.g = function(a, b) {
  return w.i(a, this, b);
};
h.U = function() {
  return this.Ia;
};
h.V = function(a, b) {
  return new Cc(this.wa, this.name, this.Ja, this.lb, b);
};
h.S = function() {
  var a = this.lb;
  return null != a ? a : this.lb = a = Ac(vc(this.name), yc(this.wa));
};
h.O = function(a, b) {
  return Yb(b, this.Ja);
};
var Dc = function Dc(a) {
  switch(arguments.length) {
    case 1:
      return Dc.h(arguments[0]);
    case 2:
      return Dc.g(arguments[0], arguments[1]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
Dc.h = function(a) {
  for (;;) {
    if (a instanceof Cc) {
      return a;
    }
    if ("string" === typeof a) {
      var b = a.indexOf("/");
      return 1 > b ? Dc.g(null, a) : Dc.g(a.substring(0, b), a.substring(b + 1, a.length));
    }
    if (a instanceof z) {
      a = a.ta;
    } else {
      throw Error("no conversion to symbol");
    }
  }
};
Dc.g = function(a, b) {
  var c = null != a ? [u.h(a), "/", u.h(b)].join("") : b;
  return new Cc(a, b, c, null, null);
};
Dc.C = 2;
function Ec(a) {
  return null != a ? a.G & 131072 || p === a.Kc ? !0 : a.G ? !1 : Ua(nc, a) : Ua(nc, a);
}
function A(a) {
  if (null == a) {
    return null;
  }
  if (null != a && (a.o & 8388608 || p === a.uc)) {
    return a.P(null);
  }
  if (Ra(a) || "string" === typeof a) {
    return 0 === a.length ? null : new Fc(a, 0, null);
  }
  if (null != a && null != a[Ya]) {
    return Gc((null !== a && Ya in a ? a[Ya] : void 0).call(a));
  }
  if (Ua(Rb, a)) {
    return Sb(a);
  }
  throw Error([u.h(a), " is not ISeqable"].join(""));
}
function B(a) {
  if (null == a) {
    return null;
  }
  if (null != a && (a.o & 64 || p === a.qb)) {
    return a.ha(null);
  }
  a = A(a);
  return null == a ? null : nb(a);
}
function Hc(a) {
  return null != a ? null != a && (a.o & 64 || p === a.qb) ? a.ja(null) : (a = A(a)) ? a.ja(null) : Ic : Ic;
}
function C(a) {
  return null == a ? null : null != a && (a.o & 128 || p === a.zb) ? a.ba() : A(Hc(a));
}
var E = function E(a) {
  switch(arguments.length) {
    case 1:
      return E.h(arguments[0]);
    case 2:
      return E.g(arguments[0], arguments[1]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return E.m(arguments[0], arguments[1], new Fc(c.slice(2), 0, null));
  }
};
E.h = function() {
  return !0;
};
E.g = function(a, b) {
  return null == a ? null == b : a === b || Pb(a, b);
};
E.m = function(a, b, c) {
  for (;;) {
    if (E.g(a, b)) {
      if (C(c)) {
        a = b, b = B(c), c = C(c);
      } else {
        return E.g(b, B(c));
      }
    } else {
      return !1;
    }
  }
};
E.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  c = C(c);
  return this.m(b, a, c);
};
E.C = 2;
function Jc(a) {
  this.J = a;
}
Jc.prototype.next = function() {
  if (null != this.J) {
    var a = B(this.J);
    this.J = C(this.J);
    return {value:a, done:!1};
  }
  return {value:null, done:!0};
};
function Kc(a) {
  return new Jc(A(a));
}
function Lc(a, b) {
  this.value = a;
  this.Gb = b;
  this.Mb = null;
  this.o = 8388672;
  this.G = 0;
}
Lc.prototype.P = function() {
  return this;
};
Lc.prototype.ha = function() {
  return this.value;
};
Lc.prototype.ja = function() {
  null == this.Mb && (this.Mb = Gc(this.Gb));
  return this.Mb;
};
function Gc(a) {
  var b = a.next();
  return t(b.done) ? null : new Lc(b.value, a);
}
function Mc(a, b) {
  a = sc(a);
  a = tc(0, a);
  return uc(a, b);
}
function Nc(a) {
  var b = 0, c = 1;
  for (a = A(a);;) {
    if (null != a) {
      b += 1, c = rc(31, c) + zc(B(a)) | 0, a = C(a);
    } else {
      return Mc(c, b);
    }
  }
}
var Oc = Mc(1, 0);
function Pc(a) {
  var b = 0, c = 0;
  for (a = A(a);;) {
    if (null != a) {
      b += 1, c = c + zc(B(a)) | 0, a = C(a);
    } else {
      return Mc(c, b);
    }
  }
}
var Qc = Mc(0, 0);
db["null"] = !0;
eb["null"] = function() {
  return 0;
};
Date.prototype.D = function(a, b) {
  return b instanceof Date && this.valueOf() === b.valueOf();
};
Date.prototype.mb = p;
Date.prototype.ib = function(a, b) {
  if (b instanceof Date) {
    return oa(this.valueOf(), b.valueOf());
  }
  throw Error(["Cannot compare ", u.h(this), " to ", u.h(b)].join(""));
};
Pb.number = function(a, b) {
  return a === b;
};
bb["function"] = !0;
Hb["function"] = !0;
Ib["function"] = function() {
  return null;
};
Qb._ = function(a) {
  return ca(a);
};
function Rc(a) {
  return a + 1;
}
function Sc() {
  this.I = !1;
  this.o = 32768;
  this.G = 0;
}
Sc.prototype.Rb = function() {
  return this.I;
};
function Tc(a) {
  return a instanceof Sc;
}
function Uc(a, b) {
  var c = a.N(null);
  if (0 === c) {
    return b.F ? b.F() : b.call(null);
  }
  for (var d = a.M(null, 0), e = 1;;) {
    if (e < c) {
      var f = a.M(null, e);
      d = b.g ? b.g(d, f) : b.call(null, d, f);
      if (Tc(d)) {
        return Gb(d);
      }
      e += 1;
    } else {
      return d;
    }
  }
}
function Vc(a, b, c) {
  var d = a.N(null), e = c;
  for (c = 0;;) {
    if (c < d) {
      var f = a.M(null, c);
      e = b.g ? b.g(e, f) : b.call(null, e, f);
      if (Tc(e)) {
        return Gb(e);
      }
      c += 1;
    } else {
      return e;
    }
  }
}
function Wc(a, b) {
  var c = a.length;
  if (0 === a.length) {
    return b.F ? b.F() : b.call(null);
  }
  for (var d = a[0], e = 1;;) {
    if (e < c) {
      var f = a[e];
      d = b.g ? b.g(d, f) : b.call(null, d, f);
      if (Tc(d)) {
        return Gb(d);
      }
      e += 1;
    } else {
      return d;
    }
  }
}
function Xc(a, b, c) {
  var d = a.length, e = c;
  for (c = 0;;) {
    if (c < d) {
      var f = a[c];
      e = b.g ? b.g(e, f) : b.call(null, e, f);
      if (Tc(e)) {
        return Gb(e);
      }
      c += 1;
    } else {
      return e;
    }
  }
}
function Yc(a, b, c, d) {
  for (var e = a.length;;) {
    if (d < e) {
      var f = a[d];
      c = b.g ? b.g(c, f) : b.call(null, c, f);
      if (Tc(c)) {
        return Gb(c);
      }
      d += 1;
    } else {
      return c;
    }
  }
}
function Zc(a) {
  return null != a ? a.o & 2 || p === a.hc ? !0 : a.o ? !1 : Ua(db, a) : Ua(db, a);
}
function $c(a) {
  return null != a ? a.o & 16 || p === a.Wb ? !0 : a.o ? !1 : Ua(jb, a) : Ua(jb, a);
}
function F(a, b, c) {
  var d = H(a);
  if (c >= d) {
    return -1;
  }
  !(0 < c) && 0 > c && (c += d, c = 0 > c ? 0 : c);
  for (;;) {
    if (c < d) {
      if (E.g(ad(a, c), b)) {
        return c;
      }
      c += 1;
    } else {
      return -1;
    }
  }
}
function bd(a, b, c) {
  var d = H(a);
  if (0 === d) {
    return -1;
  }
  0 < c ? (--d, c = d < c ? d : c) : c = 0 > c ? d + c : c;
  for (;;) {
    if (0 <= c) {
      if (E.g(ad(a, c), b)) {
        return c;
      }
      --c;
    } else {
      return -1;
    }
  }
}
function cd(a, b) {
  this.j = a;
  this.u = b;
}
cd.prototype.ca = function() {
  return this.u < this.j.length;
};
cd.prototype.next = function() {
  var a = this.j[this.u];
  this.u += 1;
  return a;
};
function Fc(a, b, c) {
  this.j = a;
  this.u = b;
  this.v = c;
  this.o = 166592766;
  this.G = 139264;
}
h = Fc.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.M = function(a, b) {
  a = b + this.u;
  if (0 <= a && a < this.j.length) {
    return this.j[a];
  }
  throw Error("Index out of bounds");
};
h.aa = function(a, b, c) {
  a = b + this.u;
  return 0 <= a && a < this.j.length ? this.j[a] : c;
};
h.za = function() {
  return new cd(this.j, this.u);
};
h.U = function() {
  return this.v;
};
h.ba = function() {
  return this.u + 1 < this.j.length ? new Fc(this.j, this.u + 1, null) : null;
};
h.N = function() {
  var a = this.j.length - this.u;
  return 0 > a ? 0 : a;
};
h.Ab = function() {
  var a = this.N(null);
  return 0 < a ? new dd(this, a - 1, null) : null;
};
h.S = function() {
  return Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return Yc(this.j, b, this.j[this.u], this.u + 1);
};
h.ga = function(a, b, c) {
  return Yc(this.j, b, c, this.u);
};
h.ha = function() {
  return this.j[this.u];
};
h.ja = function() {
  return this.u + 1 < this.j.length ? new Fc(this.j, this.u + 1, null) : Ic;
};
h.P = function() {
  return this.u < this.j.length ? this : null;
};
h.V = function(a, b) {
  return b === this.v ? this : new Fc(this.j, this.u, b);
};
h.Y = function(a, b) {
  return fd(b, this);
};
Fc.prototype[Ya] = function() {
  return Kc(this);
};
function gd(a) {
  return 0 < a.length ? new Fc(a, 0, null) : null;
}
function dd(a, b, c) {
  this.Jb = a;
  this.u = b;
  this.v = c;
  this.o = 32374990;
  this.G = 8192;
}
h = dd.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  return 0 < this.u ? new dd(this.Jb, this.u - 1, null) : null;
};
h.N = function() {
  return this.u + 1;
};
h.S = function() {
  return Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  return kb.g(this.Jb, this.u);
};
h.ja = function() {
  return 0 < this.u ? new dd(this.Jb, this.u - 1, null) : Ic;
};
h.P = function() {
  return this;
};
h.V = function(a, b) {
  return b === this.v ? this : new dd(this.Jb, this.u, b);
};
h.Y = function(a, b) {
  return fd(b, this);
};
dd.prototype[Ya] = function() {
  return Kc(this);
};
Pb._ = function(a, b) {
  return a === b;
};
var jd = function jd(a) {
  switch(arguments.length) {
    case 0:
      return jd.F();
    case 1:
      return jd.h(arguments[0]);
    case 2:
      return jd.g(arguments[0], arguments[1]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return jd.m(arguments[0], arguments[1], new Fc(c.slice(2), 0, null));
  }
};
jd.F = function() {
  return ld;
};
jd.h = function(a) {
  return a;
};
jd.g = function(a, b) {
  return null != a ? ib(a, b) : new md(null, b, null, 1, null);
};
jd.m = function(a, b, c) {
  for (;;) {
    if (t(c)) {
      a = jd.g(a, b), b = B(c), c = C(c);
    } else {
      return jd.g(a, b);
    }
  }
};
jd.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  c = C(c);
  return this.m(b, a, c);
};
jd.C = 2;
function nd(a) {
  return null == a ? null : null != a && (a.o & 4 || p === a.jc) ? a.$(null) : (null != a ? a.o & 4 || p === a.jc || (a.o ? 0 : Ua(fb, a)) : Ua(fb, a)) ? gb(a) : null;
}
function H(a) {
  if (null != a) {
    if (null != a && (a.o & 2 || p === a.hc)) {
      a = a.N(null);
    } else {
      if (Ra(a)) {
        a = a.length;
      } else {
        if ("string" === typeof a) {
          a = a.length;
        } else {
          if (null != a && (a.o & 8388608 || p === a.uc)) {
            a: {
              a = A(a);
              for (var b = 0;;) {
                if (Zc(a)) {
                  a = b + eb(a);
                  break a;
                }
                a = C(a);
                b += 1;
              }
            }
          } else {
            a = eb(a);
          }
        }
      }
    }
  } else {
    a = 0;
  }
  return a;
}
function od(a, b) {
  for (var c = null;;) {
    if (null == a) {
      return c;
    }
    if (0 === b) {
      return A(a) ? B(a) : c;
    }
    if ($c(a)) {
      return kb.i(a, b, c);
    }
    if (A(a)) {
      a = C(a), --b;
    } else {
      return c;
    }
  }
}
function ad(a, b) {
  if ("number" !== typeof b) {
    throw Error("Index argument to nth must be a number");
  }
  if (null == a) {
    return a;
  }
  if (null != a && (a.o & 16 || p === a.Wb)) {
    return a.M(null, b);
  }
  if (Ra(a)) {
    if (-1 < b && b < a.length) {
      return a[b | 0];
    }
    throw Error("Index out of bounds");
  }
  if ("string" === typeof a) {
    if (-1 < b && b < a.length) {
      return a.charAt(b | 0);
    }
    throw Error("Index out of bounds");
  }
  if (null != a && (a.o & 64 || p === a.qb) || null != a && (a.o & 16777216 || p === a.Xb)) {
    if (0 > b) {
      throw Error("Index out of bounds");
    }
    a: {
      for (;;) {
        if (null == a) {
          throw Error("Index out of bounds");
        }
        if (0 === b) {
          if (A(a)) {
            a = B(a);
            break a;
          }
          throw Error("Index out of bounds");
        }
        if ($c(a)) {
          a = kb.g(a, b);
          break a;
        }
        if (A(a)) {
          a = C(a), --b;
        } else {
          throw Error("Index out of bounds");
        }
      }
    }
    return a;
  }
  if (Ua(jb, a)) {
    return kb.g(a, b);
  }
  throw Error(["nth not supported on this type ", u.h(Xa(Va(a)))].join(""));
}
function I(a, b) {
  if ("number" !== typeof b) {
    throw Error("Index argument to nth must be a number.");
  }
  if (null == a) {
    return null;
  }
  if (null != a && (a.o & 16 || p === a.Wb)) {
    return a.aa(null, b, null);
  }
  if (Ra(a)) {
    return -1 < b && b < a.length ? a[b | 0] : null;
  }
  if ("string" === typeof a) {
    return -1 < b && b < a.length ? a.charAt(b | 0) : null;
  }
  if (null != a && (a.o & 64 || p === a.qb) || null != a && (a.o & 16777216 || p === a.Xb)) {
    return 0 > b ? null : od(a, b);
  }
  if (Ua(jb, a)) {
    return kb.i(a, b, null);
  }
  throw Error(["nth not supported on this type ", u.h(Xa(Va(a)))].join(""));
}
var w = function w(a) {
  switch(arguments.length) {
    case 2:
      return w.g(arguments[0], arguments[1]);
    case 3:
      return w.i(arguments[0], arguments[1], arguments[2]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
w.g = function(a, b) {
  return null == a ? null : null != a && (a.o & 256 || p === a.nc) ? a.T(null, b) : Ra(a) ? null != b && b < a.length ? a[b | 0] : null : "string" === typeof a ? null != b && -1 < b && b < a.length ? a.charAt(b | 0) : null : Ua(qb, a) ? rb.g(a, b) : null;
};
w.i = function(a, b, c) {
  return null != a ? null != a && (a.o & 256 || p === a.nc) ? a.H(null, b, c) : Ra(a) ? null != b && -1 < b && b < a.length ? a[b | 0] : c : "string" === typeof a ? null != b && -1 < b && b < a.length ? a.charAt(b | 0) : c : Ua(qb, a) ? rb.i(a, b, c) : c : c;
};
w.C = 3;
var pd = function pd(a) {
  switch(arguments.length) {
    case 3:
      return pd.i(arguments[0], arguments[1], arguments[2]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return pd.m(arguments[0], arguments[1], arguments[2], new Fc(c.slice(3), 0, null));
  }
};
pd.i = function(a, b, c) {
  return null != a && (a.o & 512 || p === a.fc) ? a.Ba(null, b, c) : null != a ? vb(a, b, c) : qd([b, c]);
};
pd.m = function(a, b, c, d) {
  for (;;) {
    if (a = pd.i(a, b, c), t(d)) {
      b = B(d), c = B(C(d)), d = C(C(d));
    } else {
      return a;
    }
  }
};
pd.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  var d = C(c);
  c = B(d);
  d = C(d);
  return this.m(b, a, c, d);
};
pd.C = 3;
function rd(a) {
  var b = "function" === typeof a;
  return b ? b : null != a ? p === a.ec ? !0 : a.Sb ? !1 : Ua(bb, a) : Ua(bb, a);
}
function sd(a, b) {
  this.l = a;
  this.v = b;
  this.o = 393217;
  this.G = 0;
}
h = sd.prototype;
h.U = function() {
  return this.v;
};
h.V = function(a, b) {
  return new sd(this.l, b);
};
h.ec = p;
h.call = function() {
  function a(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec, kd) {
    G = this;
    return G.l.Ua ? G.l.Ua(Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec, kd) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec, kd);
  }
  function b(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec) {
    G = this;
    return G.l.Ta ? G.l.Ta(Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec);
  }
  function c(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb) {
    G = this;
    return G.l.Sa ? G.l.Sa(Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb);
  }
  function d(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb) {
    G = this;
    return G.l.Ra ? G.l.Ra(Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb);
  }
  function e(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa) {
    G = this;
    return G.l.Qa ? G.l.Qa(Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa);
  }
  function f(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia) {
    G = this;
    return G.l.Pa ? G.l.Pa(Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia);
  }
  function g(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da) {
    G = this;
    return G.l.Oa ? G.l.Oa(Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da);
  }
  function k(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za) {
    G = this;
    return G.l.Na ? G.l.Na(Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za);
  }
  function l(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta) {
    G = this;
    return G.l.Ma ? G.l.Ma(Q, U, V, X, Y, Z, da, ia, ka, pa, ta) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta);
  }
  function m(G, Q, U, V, X, Y, Z, da, ia, ka, pa) {
    G = this;
    return G.l.La ? G.l.La(Q, U, V, X, Y, Z, da, ia, ka, pa) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa);
  }
  function n(G, Q, U, V, X, Y, Z, da, ia, ka) {
    G = this;
    return G.l.Ya ? G.l.Ya(Q, U, V, X, Y, Z, da, ia, ka) : G.l.call(null, Q, U, V, X, Y, Z, da, ia, ka);
  }
  function q(G, Q, U, V, X, Y, Z, da, ia) {
    G = this;
    return G.l.Xa ? G.l.Xa(Q, U, V, X, Y, Z, da, ia) : G.l.call(null, Q, U, V, X, Y, Z, da, ia);
  }
  function v(G, Q, U, V, X, Y, Z, da) {
    G = this;
    return G.l.Wa ? G.l.Wa(Q, U, V, X, Y, Z, da) : G.l.call(null, Q, U, V, X, Y, Z, da);
  }
  function y(G, Q, U, V, X, Y, Z) {
    G = this;
    return G.l.Ca ? G.l.Ca(Q, U, V, X, Y, Z) : G.l.call(null, Q, U, V, X, Y, Z);
  }
  function x(G, Q, U, V, X, Y) {
    G = this;
    return G.l.ea ? G.l.ea(Q, U, V, X, Y) : G.l.call(null, Q, U, V, X, Y);
  }
  function D(G, Q, U, V, X) {
    G = this;
    return G.l.L ? G.l.L(Q, U, V, X) : G.l.call(null, Q, U, V, X);
  }
  function P(G, Q, U, V) {
    G = this;
    return G.l.i ? G.l.i(Q, U, V) : G.l.call(null, Q, U, V);
  }
  function ea(G, Q, U) {
    G = this;
    return G.l.g ? G.l.g(Q, U) : G.l.call(null, Q, U);
  }
  function fa(G, Q) {
    G = this;
    return G.l.h ? G.l.h(Q) : G.l.call(null, Q);
  }
  function La(G) {
    G = this;
    return G.l.F ? G.l.F() : G.l.call(null);
  }
  var va = null;
  va = function(G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec, kd, Cg, hl) {
    switch(arguments.length) {
      case 1:
        return La.call(this, G);
      case 2:
        return fa.call(this, G, Q);
      case 3:
        return ea.call(this, G, Q, U);
      case 4:
        return P.call(this, G, Q, U, V);
      case 5:
        return D.call(this, G, Q, U, V, X);
      case 6:
        return x.call(this, G, Q, U, V, X, Y);
      case 7:
        return y.call(this, G, Q, U, V, X, Y, Z);
      case 8:
        return v.call(this, G, Q, U, V, X, Y, Z, da);
      case 9:
        return q.call(this, G, Q, U, V, X, Y, Z, da, ia);
      case 10:
        return n.call(this, G, Q, U, V, X, Y, Z, da, ia, ka);
      case 11:
        return m.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa);
      case 12:
        return l.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta);
      case 13:
        return k.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za);
      case 14:
        return g.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da);
      case 15:
        return f.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia);
      case 16:
        return e.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa);
      case 17:
        return d.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb);
      case 18:
        return c.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb);
      case 19:
        return b.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec);
      case 20:
        return a.call(this, G, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec, kd);
      case 21:
        return this.l.Va ? this.l.Va(Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec, kd, Cg) : this.l.call(null, Q, U, V, X, Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec, kd, Cg);
      case 22:
        return td(this.l, Q, U, V, X, gd([Y, Z, da, ia, ka, pa, ta, za, Da, Ia, Sa, cb, wb, ec, kd, Cg, hl]));
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  va.h = La;
  va.g = fa;
  va.i = ea;
  va.L = P;
  va.ea = D;
  va.Ca = x;
  va.Wa = y;
  va.Xa = v;
  va.Ya = q;
  va.La = n;
  va.Ma = m;
  va.Na = l;
  va.Oa = k;
  va.Pa = g;
  va.Qa = f;
  va.Ra = e;
  va.Sa = d;
  va.Ta = c;
  va.Ua = b;
  va.Va = a;
  return va;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.F = function() {
  return this.l.F ? this.l.F() : this.l.call(null);
};
h.h = function(a) {
  return this.l.h ? this.l.h(a) : this.l.call(null, a);
};
h.g = function(a, b) {
  return this.l.g ? this.l.g(a, b) : this.l.call(null, a, b);
};
h.i = function(a, b, c) {
  return this.l.i ? this.l.i(a, b, c) : this.l.call(null, a, b, c);
};
h.L = function(a, b, c, d) {
  return this.l.L ? this.l.L(a, b, c, d) : this.l.call(null, a, b, c, d);
};
h.ea = function(a, b, c, d, e) {
  return this.l.ea ? this.l.ea(a, b, c, d, e) : this.l.call(null, a, b, c, d, e);
};
h.Ca = function(a, b, c, d, e, f) {
  return this.l.Ca ? this.l.Ca(a, b, c, d, e, f) : this.l.call(null, a, b, c, d, e, f);
};
h.Wa = function(a, b, c, d, e, f, g) {
  return this.l.Wa ? this.l.Wa(a, b, c, d, e, f, g) : this.l.call(null, a, b, c, d, e, f, g);
};
h.Xa = function(a, b, c, d, e, f, g, k) {
  return this.l.Xa ? this.l.Xa(a, b, c, d, e, f, g, k) : this.l.call(null, a, b, c, d, e, f, g, k);
};
h.Ya = function(a, b, c, d, e, f, g, k, l) {
  return this.l.Ya ? this.l.Ya(a, b, c, d, e, f, g, k, l) : this.l.call(null, a, b, c, d, e, f, g, k, l);
};
h.La = function(a, b, c, d, e, f, g, k, l, m) {
  return this.l.La ? this.l.La(a, b, c, d, e, f, g, k, l, m) : this.l.call(null, a, b, c, d, e, f, g, k, l, m);
};
h.Ma = function(a, b, c, d, e, f, g, k, l, m, n) {
  return this.l.Ma ? this.l.Ma(a, b, c, d, e, f, g, k, l, m, n) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n);
};
h.Na = function(a, b, c, d, e, f, g, k, l, m, n, q) {
  return this.l.Na ? this.l.Na(a, b, c, d, e, f, g, k, l, m, n, q) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n, q);
};
h.Oa = function(a, b, c, d, e, f, g, k, l, m, n, q, v) {
  return this.l.Oa ? this.l.Oa(a, b, c, d, e, f, g, k, l, m, n, q, v) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n, q, v);
};
h.Pa = function(a, b, c, d, e, f, g, k, l, m, n, q, v, y) {
  return this.l.Pa ? this.l.Pa(a, b, c, d, e, f, g, k, l, m, n, q, v, y) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n, q, v, y);
};
h.Qa = function(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x) {
  return this.l.Qa ? this.l.Qa(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n, q, v, y, x);
};
h.Ra = function(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D) {
  return this.l.Ra ? this.l.Ra(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D);
};
h.Sa = function(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P) {
  return this.l.Sa ? this.l.Sa(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P);
};
h.Ta = function(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea) {
  return this.l.Ta ? this.l.Ta(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea);
};
h.Ua = function(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa) {
  return this.l.Ua ? this.l.Ua(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa);
};
h.Va = function(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa, La) {
  return this.l.Va ? this.l.Va(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa, La) : this.l.call(null, a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa, La);
};
function ud(a, b) {
  return "function" === typeof a ? new sd(a, b) : null == a ? null : Jb(a, b);
}
function vd(a) {
  var b = null != a;
  return (b ? null != a ? a.o & 131072 || p === a.qc || (a.o ? 0 : Ua(Hb, a)) : Ua(Hb, a) : b) ? Ib(a) : null;
}
function wd(a) {
  return null == a || Ta(A(a));
}
function xd(a) {
  return null == a ? !1 : null != a ? a.o & 8 || p === a.Hc ? !0 : a.o ? !1 : Ua(hb, a) : Ua(hb, a);
}
function yd(a) {
  return null == a ? !1 : null != a ? a.o & 4096 || p === a.Rc ? !0 : a.o ? !1 : Ua(Bb, a) : Ua(Bb, a);
}
function zd(a) {
  return null != a ? a.o & 16777216 || p === a.Xb ? !0 : a.o ? !1 : Ua(Tb, a) : Ua(Tb, a);
}
function Ad(a) {
  return null == a ? !1 : null != a ? a.o & 1024 || p === a.Nc ? !0 : a.o ? !1 : Ua(yb, a) : Ua(yb, a);
}
function Bd(a) {
  return null != a ? a.o & 67108864 || p === a.Pc ? !0 : a.o ? !1 : Ua(Vb, a) : Ua(Vb, a);
}
function Cd(a) {
  return null != a ? a.o & 16384 || p === a.Sc ? !0 : a.o ? !1 : Ua(Eb, a) : Ua(Eb, a);
}
function Dd(a) {
  return null != a ? a.G & 512 || p === a.Gc ? !0 : !1 : !1;
}
function Ed(a, b, c, d, e) {
  for (; 0 !== e;) {
    c[d] = a[b], d += 1, --e, b += 1;
  }
}
var Fd = {};
function Gd(a) {
  return null == a ? !1 : !1 === a ? !1 : !0;
}
function Hd(a) {
  return "number" === typeof a && !isNaN(a) && Infinity !== a && parseFloat(a) === parseInt(a, 10);
}
function Id(a, b) {
  return null != a && (a.o & 512 || p === a.fc) ? a.ab(null, b) : Ua(tb, a) ? ub(a, b) : w.i(a, b, Fd) === Fd ? !1 : !0;
}
function Jd(a, b) {
  if (a === b) {
    return 0;
  }
  if (null == a) {
    return -1;
  }
  if (null == b) {
    return 1;
  }
  if ("number" === typeof a) {
    if ("number" === typeof b) {
      return oa(a, b);
    }
    throw Error(["Cannot compare ", u.h(a), " to ", u.h(b)].join(""));
  }
  if (null != a ? a.G & 2048 || p === a.mb || (a.G ? 0 : Ua(fc, a)) : Ua(fc, a)) {
    return gc(a, b);
  }
  if ("string" !== typeof a && !Ra(a) && !0 !== a && !1 !== a || Va(a) !== Va(b)) {
    throw Error(["Cannot compare ", u.h(a), " to ", u.h(b)].join(""));
  }
  return oa(a, b);
}
function Kd(a, b) {
  var c = H(a), d = H(b);
  if (c < d) {
    a = -1;
  } else {
    if (c > d) {
      a = 1;
    } else {
      if (0 === c) {
        a = 0;
      } else {
        a: {
          for (d = 0;;) {
            var e = Jd(ad(a, d), ad(b, d));
            if (0 === e && d + 1 < c) {
              d += 1;
            } else {
              a = e;
              break a;
            }
          }
        }
      }
    }
  }
  return a;
}
function Ld(a) {
  return E.g(a, Jd) ? Jd : function(b, c) {
    var d = a.g ? a.g(b, c) : a.call(null, b, c);
    return "number" === typeof d ? d : t(d) ? -1 : t(a.g ? a.g(c, b) : a.call(null, c, b)) ? 1 : 0;
  };
}
function Md(a, b) {
  if (A(b)) {
    a: {
      var c = [];
      for (var d = A(b);;) {
        if (null != d) {
          c.push(B(d)), d = C(d);
        } else {
          break a;
        }
      }
    }
    a = Ld(a);
    qa(c, a);
    return ud(A(c), vd(b));
  }
  return Ic;
}
function Nd(a) {
  var b = Od;
  return Md(function(c, d) {
    c = b.h ? b.h(c) : b.call(null, c);
    d = b.h ? b.h(d) : b.call(null, d);
    var e = Ld(Jd);
    return e.g ? e.g(c, d) : e.call(null, c, d);
  }, a);
}
function hd(a, b) {
  return (b = A(b)) ? ab(a, B(b), C(b)) : a.F ? a.F() : a.call(null);
}
function id(a, b, c) {
  for (c = A(c);;) {
    if (c) {
      var d = B(c);
      b = a.g ? a.g(b, d) : a.call(null, b, d);
      if (Tc(b)) {
        return Gb(b);
      }
      c = C(c);
    } else {
      return b;
    }
  }
}
function Pd(a, b) {
  a = oc(a);
  if (t(a.ca())) {
    for (var c = a.next();;) {
      if (a.ca()) {
        var d = a.next();
        c = b.g ? b.g(c, d) : b.call(null, c, d);
        if (Tc(c)) {
          return Gb(c);
        }
      } else {
        return c;
      }
    }
  } else {
    return b.F ? b.F() : b.call(null);
  }
}
function Qd(a, b, c) {
  for (a = oc(a);;) {
    if (a.ca()) {
      var d = a.next();
      c = b.g ? b.g(c, d) : b.call(null, c, d);
      if (Tc(c)) {
        return Gb(c);
      }
    } else {
      return c;
    }
  }
}
function Rd(a, b) {
  return null != b && (b.o & 524288 || p === b.sc) ? b.fa(null, a) : Ra(b) ? Wc(b, a) : "string" === typeof b ? Wc(b, a) : Ua(Kb, b) ? Lb.g(b, a) : Ec(b) ? Pd(b, a) : hd(a, b);
}
function ab(a, b, c) {
  return null != c && (c.o & 524288 || p === c.sc) ? c.ga(null, a, b) : Ra(c) ? Xc(c, a, b) : "string" === typeof c ? Xc(c, a, b) : Ua(Kb, c) ? Lb.i(c, a, b) : Ec(c) ? Qd(c, a, b) : id(a, b, c);
}
function Sd(a, b, c) {
  return null != c ? Ob(c, a, b) : b;
}
function Td(a) {
  return a;
}
function Ud(a, b, c, d) {
  a = a.h ? a.h(b) : a.call(null, b);
  c = ab(a, c, d);
  return a.h ? a.h(c) : a.call(null, c);
}
var Vd = function Vd(a) {
  switch(arguments.length) {
    case 1:
      return Vd.h(arguments[0]);
    case 2:
      return Vd.g(arguments[0], arguments[1]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return Vd.m(arguments[0], arguments[1], new Fc(c.slice(2), 0, null));
  }
};
Vd.h = function() {
  return !0;
};
Vd.g = function(a, b) {
  return a > b;
};
Vd.m = function(a, b, c) {
  for (;;) {
    if (a > b) {
      if (C(c)) {
        a = b, b = B(c), c = C(c);
      } else {
        return b > B(c);
      }
    } else {
      return !1;
    }
  }
};
Vd.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  c = C(c);
  return this.m(b, a, c);
};
Vd.C = 2;
var J = function J(a) {
  switch(arguments.length) {
    case 1:
      return J.h(arguments[0]);
    case 2:
      return J.g(arguments[0], arguments[1]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return J.m(arguments[0], arguments[1], new Fc(c.slice(2), 0, null));
  }
};
J.h = function() {
  return !0;
};
J.g = function(a, b) {
  return a >= b;
};
J.m = function(a, b, c) {
  for (;;) {
    if (a >= b) {
      if (C(c)) {
        a = b, b = B(c), c = C(c);
      } else {
        return b >= B(c);
      }
    } else {
      return !1;
    }
  }
};
J.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  c = C(c);
  return this.m(b, a, c);
};
J.C = 2;
function Wd(a) {
  return 0 <= a ? Math.floor(a) : Math.ceil(a);
}
function Xd(a, b) {
  return (a % b + b) % b;
}
function Yd(a, b) {
  return Wd((a - a % b) / b);
}
function Zd(a, b) {
  return a - b * Yd(a, b);
}
function $d(a) {
  a -= a >> 1 & 1431655765;
  a = (a & 858993459) + (a >> 2 & 858993459);
  return 16843009 * (a + (a >> 4) & 252645135) >> 24;
}
var u = function u(a) {
  switch(arguments.length) {
    case 0:
      return u.F();
    case 1:
      return u.h(arguments[0]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return u.m(arguments[0], new Fc(c.slice(1), 0, null));
  }
};
u.F = function() {
  return "";
};
u.h = function(a) {
  return null == a ? "" : [a].join("");
};
u.m = function(a, b) {
  for (a = new xa(u.h(a));;) {
    if (t(b)) {
      a = a.append(u.h(B(b))), b = C(b);
    } else {
      return a.toString();
    }
  }
};
u.B = function(a) {
  var b = B(a);
  a = C(a);
  return this.m(b, a);
};
u.C = 1;
function ae(a, b) {
  return a.substring(b);
}
function be(a, b, c) {
  return a.substring(b, c);
}
function ed(a, b) {
  if (zd(b)) {
    if (Zc(a) && Zc(b) && H(a) !== H(b)) {
      a = !1;
    } else {
      a: {
        for (a = A(a), b = A(b);;) {
          if (null == a) {
            a = null == b;
            break a;
          }
          if (null != b && E.g(B(a), B(b))) {
            a = C(a), b = C(b);
          } else {
            a = !1;
            break a;
          }
        }
      }
    }
  } else {
    a = null;
  }
  return Gd(a);
}
function md(a, b, c, d, e) {
  this.v = a;
  this.first = b;
  this.Za = c;
  this.count = d;
  this.A = e;
  this.o = 65937646;
  this.G = 8192;
}
h = md.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, this.count);
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  return 1 === this.count ? null : this.Za;
};
h.N = function() {
  return this.count;
};
h.rb = function() {
  return this.first;
};
h.sb = function() {
  return this.ja(null);
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Jb(Ic, this.v);
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  return this.first;
};
h.ja = function() {
  return 1 === this.count ? Ic : this.Za;
};
h.P = function() {
  return this;
};
h.V = function(a, b) {
  return b === this.v ? this : new md(b, this.first, this.Za, this.count, this.A);
};
h.Y = function(a, b) {
  return new md(this.v, b, this, this.count + 1, null);
};
md.prototype[Ya] = function() {
  return Kc(this);
};
function ce(a) {
  this.v = a;
  this.o = 65937614;
  this.G = 8192;
}
h = ce.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  return null;
};
h.N = function() {
  return 0;
};
h.rb = function() {
  return null;
};
h.sb = function() {
  throw Error("Can't pop empty list");
};
h.S = function() {
  return Oc;
};
h.D = function(a, b) {
  return (null != b ? b.o & 33554432 || p === b.Mc || (b.o ? 0 : Ua(Ub, b)) : Ua(Ub, b)) || zd(b) ? null == A(b) : !1;
};
h.$ = function() {
  return this;
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  return null;
};
h.ja = function() {
  return Ic;
};
h.P = function() {
  return null;
};
h.V = function(a, b) {
  return b === this.v ? this : new ce(b);
};
h.Y = function(a, b) {
  return new md(this.v, b, null, 1, null);
};
var Ic = new ce(null);
ce.prototype[Ya] = function() {
  return Kc(this);
};
function de(a) {
  return (null != a ? a.o & 134217728 || p === a.Qc || (a.o ? 0 : Ua(Wb, a)) : Ua(Wb, a)) ? (a = Xb(a)) ? a : Ic : ab(jd, Ic, a);
}
function ee(a, b, c, d) {
  this.v = a;
  this.first = b;
  this.Za = c;
  this.A = d;
  this.o = 65929452;
  this.G = 8192;
}
h = ee.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  return null == this.Za ? null : A(this.Za);
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  return this.first;
};
h.ja = function() {
  return null == this.Za ? Ic : this.Za;
};
h.P = function() {
  return this;
};
h.V = function(a, b) {
  return b === this.v ? this : new ee(b, this.first, this.Za, this.A);
};
h.Y = function(a, b) {
  return new ee(null, b, this, null);
};
ee.prototype[Ya] = function() {
  return Kc(this);
};
function fd(a, b) {
  return null == b ? new md(null, a, null, 1, null) : null != b && (b.o & 64 || p === b.qb) ? new ee(null, a, b, null) : new ee(null, a, A(b), null);
}
function fe(a, b) {
  if (a.ta === b.ta) {
    return 0;
  }
  var c = Ta(a.wa);
  if (t(c ? b.wa : c)) {
    return -1;
  }
  if (t(a.wa)) {
    if (Ta(b.wa)) {
      return 1;
    }
    c = oa(a.wa, b.wa);
    return 0 === c ? oa(a.name, b.name) : c;
  }
  return oa(a.name, b.name);
}
function z(a, b, c, d) {
  this.wa = a;
  this.name = b;
  this.ta = c;
  this.lb = d;
  this.o = 2153775105;
  this.G = 4096;
}
h = z.prototype;
h.toString = function() {
  return [":", u.h(this.ta)].join("");
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.D = function(a, b) {
  return b instanceof z ? this.ta === b.ta : !1;
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return w.g(c, this);
      case 3:
        return w.i(c, this, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return w.g(c, this);
  };
  a.i = function(b, c, d) {
    return w.i(c, this, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return w.g(a, this);
};
h.g = function(a, b) {
  return w.i(a, this, b);
};
h.S = function() {
  var a = this.lb;
  return null != a ? a : this.lb = a = Ac(vc(this.name), yc(this.wa)) + 2654435769 | 0;
};
h.O = function(a, b) {
  return Yb(b, [":", u.h(this.ta)].join(""));
};
function ge(a, b) {
  return a === b ? !0 : a instanceof z && b instanceof z ? a.ta === b.ta : !1;
}
function he(a) {
  if (null != a && (a.G & 4096 || p === a.rc)) {
    return a.wa;
  }
  throw Error(["Doesn't support namespace: ", u.h(a)].join(""));
}
var ie = function ie(a) {
  switch(arguments.length) {
    case 1:
      return ie.h(arguments[0]);
    case 2:
      return ie.g(arguments[0], arguments[1]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
ie.h = function(a) {
  if (a instanceof z) {
    return a;
  }
  if (a instanceof Cc) {
    return new z(he(a), je(a), a.Ja, null);
  }
  if (E.g("/", a)) {
    return new z(null, a, a, null);
  }
  if ("string" === typeof a) {
    var b = a.split("/");
    return 2 === b.length ? new z(b[0], b[1], a, null) : new z(null, b[0], a, null);
  }
  return null;
};
ie.g = function(a, b) {
  a = a instanceof z ? je(a) : a instanceof Cc ? je(a) : a;
  b = b instanceof z ? je(b) : b instanceof Cc ? je(b) : b;
  return new z(a, b, [t(a) ? [u.h(a), "/"].join("") : null, u.h(b)].join(""), null);
};
ie.C = 2;
function ke(a, b, c) {
  this.v = a;
  this.Cb = b;
  this.J = null;
  this.A = c;
  this.o = 32374988;
  this.G = 1;
}
h = ke.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
function le(a) {
  null != a.Cb && (a.J = a.Cb.F ? a.Cb.F() : a.Cb.call(null), a.Cb = null);
  return a.J;
}
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  this.P(null);
  return null == this.J ? null : C(this.J);
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Jb(Ic, this.v);
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  this.P(null);
  return null == this.J ? null : B(this.J);
};
h.ja = function() {
  this.P(null);
  return null != this.J ? Hc(this.J) : Ic;
};
h.P = function() {
  le(this);
  if (null == this.J) {
    return null;
  }
  for (var a = this.J;;) {
    if (a instanceof ke) {
      a = le(a);
    } else {
      return this.J = a, A(this.J);
    }
  }
};
h.V = function(a, b) {
  var c = this;
  return b === this.v ? c : new ke(b, function() {
    return c.P(null);
  }, this.A);
};
h.Y = function(a, b) {
  return fd(b, this);
};
ke.prototype[Ya] = function() {
  return Kc(this);
};
function me(a) {
  this.Ob = a;
  this.end = 0;
  this.o = 2;
  this.G = 0;
}
me.prototype.add = function(a) {
  this.Ob[this.end] = a;
  return this.end += 1;
};
me.prototype.X = function() {
  var a = new ne(this.Ob, 0, this.end);
  this.Ob = null;
  return a;
};
me.prototype.N = function() {
  return this.end;
};
function ne(a, b, c) {
  this.j = a;
  this.sa = b;
  this.end = c;
  this.o = 524306;
  this.G = 0;
}
h = ne.prototype;
h.N = function() {
  return this.end - this.sa;
};
h.M = function(a, b) {
  return this.j[this.sa + b];
};
h.aa = function(a, b, c) {
  return 0 <= b && b < this.end - this.sa ? this.j[this.sa + b] : c;
};
h.Qb = function() {
  if (this.sa === this.end) {
    throw Error("-drop-first of empty chunk");
  }
  return new ne(this.j, this.sa + 1, this.end);
};
h.fa = function(a, b) {
  return Yc(this.j, b, this.j[this.sa], this.sa + 1);
};
h.ga = function(a, b, c) {
  return Yc(this.j, b, c, this.sa);
};
function oe(a, b, c, d) {
  this.X = a;
  this.Fa = b;
  this.v = c;
  this.A = d;
  this.o = 31850732;
  this.G = 1536;
}
h = oe.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  return 1 < eb(this.X) ? new oe(hc(this.X), this.Fa, null, null) : null == this.Fa ? null : Sb(this.Fa);
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.ha = function() {
  return kb.g(this.X, 0);
};
h.ja = function() {
  return 1 < eb(this.X) ? new oe(hc(this.X), this.Fa, null, null) : null == this.Fa ? Ic : this.Fa;
};
h.P = function() {
  return this;
};
h.yb = function() {
  return this.X;
};
h.bb = function() {
  return null == this.Fa ? Ic : this.Fa;
};
h.V = function(a, b) {
  return b === this.v ? this : new oe(this.X, this.Fa, b, this.A);
};
h.Y = function(a, b) {
  return fd(b, this);
};
h.Kb = function() {
  return null == this.Fa ? null : this.Fa;
};
oe.prototype[Ya] = function() {
  return Kc(this);
};
function pe(a, b) {
  return 0 === eb(a) ? b : new oe(a, b, null, null);
}
function qe(a, b) {
  a.add(b);
}
function re(a, b) {
  if (Zc(b)) {
    return H(b);
  }
  var c = 0;
  for (b = A(b);;) {
    if (null != b && c < a) {
      c += 1, b = C(b);
    } else {
      return c;
    }
  }
}
var se = function se(a) {
  if (null == a) {
    return null;
  }
  var c = C(a);
  return null == c ? A(B(a)) : fd(B(a), se.h ? se.h(c) : se.call(null, c));
}, te = function te(a) {
  switch(arguments.length) {
    case 0:
      return te.F();
    case 1:
      return te.h(arguments[0]);
    case 2:
      return te.g(arguments[0], arguments[1]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return te.m(arguments[0], arguments[1], new Fc(c.slice(2), 0, null));
  }
};
te.F = function() {
  return new ke(null, function() {
    return null;
  }, null);
};
te.h = function(a) {
  return new ke(null, function() {
    return a;
  }, null);
};
te.g = function(a, b) {
  return new ke(null, function() {
    var c = A(a);
    return c ? Dd(c) ? pe(ic(c), te.g(jc(c), b)) : fd(B(c), te.g(Hc(c), b)) : b;
  }, null);
};
te.m = function(a, b, c) {
  return function g(e, f) {
    return new ke(null, function() {
      var k = A(e);
      return k ? Dd(k) ? pe(ic(k), g(jc(k), f)) : fd(B(k), g(Hc(k), f)) : t(f) ? g(B(f), C(f)) : null;
    }, null);
  }(te.g(a, b), c);
};
te.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  c = C(c);
  return this.m(b, a, c);
};
te.C = 2;
var ue = function ue(a) {
  switch(arguments.length) {
    case 0:
      return ue.F();
    case 1:
      return ue.h(arguments[0]);
    case 2:
      return ue.g(arguments[0], arguments[1]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return ue.m(arguments[0], arguments[1], new Fc(c.slice(2), 0, null));
  }
};
ue.F = function() {
  return ac(ld);
};
ue.h = function(a) {
  return a;
};
ue.g = function(a, b) {
  return bc(a, b);
};
ue.m = function(a, b, c) {
  for (;;) {
    if (a = bc(a, b), t(c)) {
      b = B(c), c = C(c);
    } else {
      return a;
    }
  }
};
ue.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  c = C(c);
  return this.m(b, a, c);
};
ue.C = 2;
function ve(a, b, c) {
  var d = A(c);
  if (0 === b) {
    return a.F ? a.F() : a.call(null);
  }
  c = nb(d);
  var e = ob(d);
  if (1 === b) {
    return a.h ? a.h(c) : a.call(null, c);
  }
  d = nb(e);
  var f = ob(e);
  if (2 === b) {
    return a.g ? a.g(c, d) : a.call(null, c, d);
  }
  e = nb(f);
  var g = ob(f);
  if (3 === b) {
    return a.i ? a.i(c, d, e) : a.call(null, c, d, e);
  }
  f = nb(g);
  var k = ob(g);
  if (4 === b) {
    return a.L ? a.L(c, d, e, f) : a.call(null, c, d, e, f);
  }
  g = nb(k);
  var l = ob(k);
  if (5 === b) {
    return a.ea ? a.ea(c, d, e, f, g) : a.call(null, c, d, e, f, g);
  }
  k = nb(l);
  var m = ob(l);
  if (6 === b) {
    return a.Ca ? a.Ca(c, d, e, f, g, k) : a.call(null, c, d, e, f, g, k);
  }
  l = nb(m);
  var n = ob(m);
  if (7 === b) {
    return a.Wa ? a.Wa(c, d, e, f, g, k, l) : a.call(null, c, d, e, f, g, k, l);
  }
  m = nb(n);
  var q = ob(n);
  if (8 === b) {
    return a.Xa ? a.Xa(c, d, e, f, g, k, l, m) : a.call(null, c, d, e, f, g, k, l, m);
  }
  n = nb(q);
  var v = ob(q);
  if (9 === b) {
    return a.Ya ? a.Ya(c, d, e, f, g, k, l, m, n) : a.call(null, c, d, e, f, g, k, l, m, n);
  }
  q = nb(v);
  var y = ob(v);
  if (10 === b) {
    return a.La ? a.La(c, d, e, f, g, k, l, m, n, q) : a.call(null, c, d, e, f, g, k, l, m, n, q);
  }
  v = nb(y);
  var x = ob(y);
  if (11 === b) {
    return a.Ma ? a.Ma(c, d, e, f, g, k, l, m, n, q, v) : a.call(null, c, d, e, f, g, k, l, m, n, q, v);
  }
  y = nb(x);
  var D = ob(x);
  if (12 === b) {
    return a.Na ? a.Na(c, d, e, f, g, k, l, m, n, q, v, y) : a.call(null, c, d, e, f, g, k, l, m, n, q, v, y);
  }
  x = nb(D);
  var P = ob(D);
  if (13 === b) {
    return a.Oa ? a.Oa(c, d, e, f, g, k, l, m, n, q, v, y, x) : a.call(null, c, d, e, f, g, k, l, m, n, q, v, y, x);
  }
  D = nb(P);
  var ea = ob(P);
  if (14 === b) {
    return a.Pa ? a.Pa(c, d, e, f, g, k, l, m, n, q, v, y, x, D) : a.call(null, c, d, e, f, g, k, l, m, n, q, v, y, x, D);
  }
  P = nb(ea);
  var fa = ob(ea);
  if (15 === b) {
    return a.Qa ? a.Qa(c, d, e, f, g, k, l, m, n, q, v, y, x, D, P) : a.call(null, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P);
  }
  ea = nb(fa);
  var La = ob(fa);
  if (16 === b) {
    return a.Ra ? a.Ra(c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea) : a.call(null, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea);
  }
  fa = nb(La);
  var va = ob(La);
  if (17 === b) {
    return a.Sa ? a.Sa(c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa) : a.call(null, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa);
  }
  La = nb(va);
  var G = ob(va);
  if (18 === b) {
    return a.Ta ? a.Ta(c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa, La) : a.call(null, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa, La);
  }
  va = nb(G);
  G = ob(G);
  if (19 === b) {
    return a.Ua ? a.Ua(c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa, La, va) : a.call(null, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa, La, va);
  }
  var Q = nb(G);
  ob(G);
  if (20 === b) {
    return a.Va ? a.Va(c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa, La, va, Q) : a.call(null, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P, ea, fa, La, va, Q);
  }
  throw Error("Only up to 20 arguments supported on functions");
}
function we(a) {
  return null != a && (a.o & 128 || p === a.zb) ? a.ba() : A(Hc(a));
}
function xe(a, b, c) {
  return null == c ? a.h ? a.h(b) : a.call(a, b) : ye(a, b, nb(c), we(c));
}
function ye(a, b, c, d) {
  return null == d ? a.g ? a.g(b, c) : a.call(a, b, c) : ze(a, b, c, nb(d), we(d));
}
function ze(a, b, c, d, e) {
  return null == e ? a.i ? a.i(b, c, d) : a.call(a, b, c, d) : Ae(a, b, c, d, nb(e), we(e));
}
function Ae(a, b, c, d, e, f) {
  if (null == f) {
    return a.L ? a.L(b, c, d, e) : a.call(a, b, c, d, e);
  }
  var g = nb(f), k = C(f);
  if (null == k) {
    return a.ea ? a.ea(b, c, d, e, g) : a.call(a, b, c, d, e, g);
  }
  f = nb(k);
  var l = C(k);
  if (null == l) {
    return a.Ca ? a.Ca(b, c, d, e, g, f) : a.call(a, b, c, d, e, g, f);
  }
  k = nb(l);
  var m = C(l);
  if (null == m) {
    return a.Wa ? a.Wa(b, c, d, e, g, f, k) : a.call(a, b, c, d, e, g, f, k);
  }
  l = nb(m);
  var n = C(m);
  if (null == n) {
    return a.Xa ? a.Xa(b, c, d, e, g, f, k, l) : a.call(a, b, c, d, e, g, f, k, l);
  }
  m = nb(n);
  var q = C(n);
  if (null == q) {
    return a.Ya ? a.Ya(b, c, d, e, g, f, k, l, m) : a.call(a, b, c, d, e, g, f, k, l, m);
  }
  n = nb(q);
  var v = C(q);
  if (null == v) {
    return a.La ? a.La(b, c, d, e, g, f, k, l, m, n) : a.call(a, b, c, d, e, g, f, k, l, m, n);
  }
  q = nb(v);
  var y = C(v);
  if (null == y) {
    return a.Ma ? a.Ma(b, c, d, e, g, f, k, l, m, n, q) : a.call(a, b, c, d, e, g, f, k, l, m, n, q);
  }
  v = nb(y);
  var x = C(y);
  if (null == x) {
    return a.Na ? a.Na(b, c, d, e, g, f, k, l, m, n, q, v) : a.call(a, b, c, d, e, g, f, k, l, m, n, q, v);
  }
  y = nb(x);
  var D = C(x);
  if (null == D) {
    return a.Oa ? a.Oa(b, c, d, e, g, f, k, l, m, n, q, v, y) : a.call(a, b, c, d, e, g, f, k, l, m, n, q, v, y);
  }
  x = nb(D);
  var P = C(D);
  if (null == P) {
    return a.Pa ? a.Pa(b, c, d, e, g, f, k, l, m, n, q, v, y, x) : a.call(a, b, c, d, e, g, f, k, l, m, n, q, v, y, x);
  }
  D = nb(P);
  var ea = C(P);
  if (null == ea) {
    return a.Qa ? a.Qa(b, c, d, e, g, f, k, l, m, n, q, v, y, x, D) : a.call(a, b, c, d, e, g, f, k, l, m, n, q, v, y, x, D);
  }
  P = nb(ea);
  var fa = C(ea);
  if (null == fa) {
    return a.Ra ? a.Ra(b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P) : a.call(a, b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P);
  }
  ea = nb(fa);
  var La = C(fa);
  if (null == La) {
    return a.Sa ? a.Sa(b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P, ea) : a.call(a, b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P, ea);
  }
  fa = nb(La);
  var va = C(La);
  if (null == va) {
    return a.Ta ? a.Ta(b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P, ea, fa) : a.call(a, b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P, ea, fa);
  }
  La = nb(va);
  var G = C(va);
  if (null == G) {
    return a.Ua ? a.Ua(b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P, ea, fa, La) : a.call(a, b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P, ea, fa, La);
  }
  va = nb(G);
  G = C(G);
  if (null == G) {
    return a.Va ? a.Va(b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P, ea, fa, La, va) : a.call(a, b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P, ea, fa, La, va);
  }
  b = [b, c, d, e, g, f, k, l, m, n, q, v, y, x, D, P, ea, fa, La, va];
  for (c = G;;) {
    if (c) {
      b.push(nb(c)), c = C(c);
    } else {
      break;
    }
  }
  return a.apply(a, b);
}
function Be(a, b) {
  if (a.B) {
    var c = a.C, d = re(c + 1, b);
    return d <= c ? ve(a, d, b) : a.B(b);
  }
  b = A(b);
  return null == b ? a.F ? a.F() : a.call(a) : xe(a, nb(b), we(b));
}
function Ce(a, b, c, d, e) {
  return a.B ? (b = fd(b, fd(c, fd(d, e))), c = a.C, e = 3 + re(c - 2, e), e <= c ? ve(a, e, b) : a.B(b)) : ze(a, b, c, d, A(e));
}
function td(a, b, c, d, e, f) {
  return a.B ? (f = se(f), b = fd(b, fd(c, fd(d, fd(e, f)))), c = a.C, f = 4 + re(c - 3, f), f <= c ? ve(a, f, b) : a.B(b)) : Ae(a, b, c, d, e, se(f));
}
function De(a) {
  return null != a && (a.o & 64 || p === a.qb) ? Be(Ee, a) : a;
}
function Fe() {
  if ("undefined" === typeof ya || "undefined" === typeof Aa || "undefined" === typeof Ba) {
    Ba = function(a) {
      this.Bc = a;
      this.o = 393216;
      this.G = 0;
    }, Ba.prototype.V = function(a, b) {
      return new Ba(b);
    }, Ba.prototype.U = function() {
      return this.Bc;
    }, Ba.prototype.ca = function() {
      return !1;
    }, Ba.prototype.next = function() {
      return Error("No such element");
    }, Ba.prototype.remove = function() {
      return Error("Unsupported operation");
    }, Ba.Zb = !0, Ba.Lb = "cljs.core/t_cljs$core5758", Ba.zc = function(a) {
      return Yb(a, "cljs.core/t_cljs$core5758");
    };
  }
  return new Ba(Ge);
}
var He = {}, Ie = {};
function Je(a) {
  this.xb = He;
  this.gb = a;
}
Je.prototype.ca = function() {
  this.xb === He ? (this.xb = Ie, this.gb = A(this.gb)) : this.xb === this.gb && (this.gb = C(this.xb));
  return null != this.gb;
};
Je.prototype.next = function() {
  if (this.ca()) {
    return this.xb = this.gb, B(this.gb);
  }
  throw Error("No such element");
};
Je.prototype.remove = function() {
  return Error("Unsupported operation");
};
function Ke(a, b) {
  for (;;) {
    if (null == A(b)) {
      return !0;
    }
    var c = B(b);
    c = a.h ? a.h(c) : a.call(null, c);
    if (t(c)) {
      b = C(b);
    } else {
      return !1;
    }
  }
}
function Le(a) {
  for (var b = Td;;) {
    if (a = A(a)) {
      var c = B(a);
      c = b.h ? b.h(c) : b.call(null, c);
      if (t(c)) {
        return c;
      }
      a = C(a);
    } else {
      return null;
    }
  }
}
function Me(a) {
  if (Hd(a)) {
    return 0 === (a & 1);
  }
  throw Error(["Argument must be an integer: ", u.h(a)].join(""));
}
function Ne(a) {
  return function() {
    function b(g, k) {
      return Ta(a.g ? a.g(g, k) : a.call(null, g, k));
    }
    function c(g) {
      return Ta(a.h ? a.h(g) : a.call(null, g));
    }
    function d() {
      return Ta(a.F ? a.F() : a.call(null));
    }
    var e = null, f = function() {
      function g(l, m, n) {
        var q = null;
        if (2 < arguments.length) {
          q = 0;
          for (var v = Array(arguments.length - 2); q < v.length;) {
            v[q] = arguments[q + 2], ++q;
          }
          q = new Fc(v, 0, null);
        }
        return k.call(this, l, m, q);
      }
      function k(l, m, n) {
        a.B ? (l = fd(l, fd(m, n)), m = a.C, n = 2 + re(m - 1, n), n = n <= m ? ve(a, n, l) : a.B(l)) : n = ye(a, l, m, A(n));
        return Ta(n);
      }
      g.C = 2;
      g.B = function(l) {
        var m = B(l);
        l = C(l);
        var n = B(l);
        l = Hc(l);
        return k(m, n, l);
      };
      g.m = k;
      return g;
    }();
    e = function(g, k, l) {
      switch(arguments.length) {
        case 0:
          return d.call(this);
        case 1:
          return c.call(this, g);
        case 2:
          return b.call(this, g, k);
        default:
          var m = null;
          if (2 < arguments.length) {
            m = 0;
            for (var n = Array(arguments.length - 2); m < n.length;) {
              n[m] = arguments[m + 2], ++m;
            }
            m = new Fc(n, 0, null);
          }
          return f.m(g, k, m);
      }
      throw Error("Invalid arity: " + arguments.length);
    };
    e.C = 2;
    e.B = f.B;
    e.F = d;
    e.h = c;
    e.g = b;
    e.m = f.m;
    return e;
  }();
}
function Oe() {
  return function() {
    function a(b) {
      if (0 < arguments.length) {
        for (var c = 0, d = Array(arguments.length - 0); c < d.length;) {
          d[c] = arguments[c + 0], ++c;
        }
      }
      return !0;
    }
    a.C = 0;
    a.B = function(b) {
      A(b);
      return !0;
    };
    a.m = function() {
      return !0;
    };
    return a;
  }();
}
var Pe = function Pe(a) {
  switch(arguments.length) {
    case 0:
      return Pe.F();
    case 1:
      return Pe.h(arguments[0]);
    case 2:
      return Pe.g(arguments[0], arguments[1]);
    case 3:
      return Pe.i(arguments[0], arguments[1], arguments[2]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return Pe.m(arguments[0], arguments[1], arguments[2], new Fc(c.slice(3), 0, null));
  }
};
Pe.F = function() {
  return Td;
};
Pe.h = function(a) {
  return a;
};
Pe.g = function(a, b) {
  return function() {
    function c(l, m, n) {
      l = b.i ? b.i(l, m, n) : b.call(null, l, m, n);
      return a.h ? a.h(l) : a.call(null, l);
    }
    function d(l, m) {
      l = b.g ? b.g(l, m) : b.call(null, l, m);
      return a.h ? a.h(l) : a.call(null, l);
    }
    function e(l) {
      l = b.h ? b.h(l) : b.call(null, l);
      return a.h ? a.h(l) : a.call(null, l);
    }
    function f() {
      var l = b.F ? b.F() : b.call(null);
      return a.h ? a.h(l) : a.call(null, l);
    }
    var g = null, k = function() {
      function l(n, q, v, y) {
        var x = null;
        if (3 < arguments.length) {
          x = 0;
          for (var D = Array(arguments.length - 3); x < D.length;) {
            D[x] = arguments[x + 3], ++x;
          }
          x = new Fc(D, 0, null);
        }
        return m.call(this, n, q, v, x);
      }
      function m(n, q, v, y) {
        n = Ce(b, n, q, v, y);
        return a.h ? a.h(n) : a.call(null, n);
      }
      l.C = 3;
      l.B = function(n) {
        var q = B(n);
        n = C(n);
        var v = B(n);
        n = C(n);
        var y = B(n);
        n = Hc(n);
        return m(q, v, y, n);
      };
      l.m = m;
      return l;
    }();
    g = function(l, m, n, q) {
      switch(arguments.length) {
        case 0:
          return f.call(this);
        case 1:
          return e.call(this, l);
        case 2:
          return d.call(this, l, m);
        case 3:
          return c.call(this, l, m, n);
        default:
          var v = null;
          if (3 < arguments.length) {
            v = 0;
            for (var y = Array(arguments.length - 3); v < y.length;) {
              y[v] = arguments[v + 3], ++v;
            }
            v = new Fc(y, 0, null);
          }
          return k.m(l, m, n, v);
      }
      throw Error("Invalid arity: " + arguments.length);
    };
    g.C = 3;
    g.B = k.B;
    g.F = f;
    g.h = e;
    g.g = d;
    g.i = c;
    g.m = k.m;
    return g;
  }();
};
Pe.i = function(a, b, c) {
  return function() {
    function d(m, n, q) {
      m = c.i ? c.i(m, n, q) : c.call(null, m, n, q);
      m = b.h ? b.h(m) : b.call(null, m);
      return a.h ? a.h(m) : a.call(null, m);
    }
    function e(m, n) {
      m = c.g ? c.g(m, n) : c.call(null, m, n);
      m = b.h ? b.h(m) : b.call(null, m);
      return a.h ? a.h(m) : a.call(null, m);
    }
    function f(m) {
      m = c.h ? c.h(m) : c.call(null, m);
      m = b.h ? b.h(m) : b.call(null, m);
      return a.h ? a.h(m) : a.call(null, m);
    }
    function g() {
      var m = c.F ? c.F() : c.call(null);
      m = b.h ? b.h(m) : b.call(null, m);
      return a.h ? a.h(m) : a.call(null, m);
    }
    var k = null, l = function() {
      function m(q, v, y, x) {
        var D = null;
        if (3 < arguments.length) {
          D = 0;
          for (var P = Array(arguments.length - 3); D < P.length;) {
            P[D] = arguments[D + 3], ++D;
          }
          D = new Fc(P, 0, null);
        }
        return n.call(this, q, v, y, D);
      }
      function n(q, v, y, x) {
        q = Ce(c, q, v, y, x);
        q = b.h ? b.h(q) : b.call(null, q);
        return a.h ? a.h(q) : a.call(null, q);
      }
      m.C = 3;
      m.B = function(q) {
        var v = B(q);
        q = C(q);
        var y = B(q);
        q = C(q);
        var x = B(q);
        q = Hc(q);
        return n(v, y, x, q);
      };
      m.m = n;
      return m;
    }();
    k = function(m, n, q, v) {
      switch(arguments.length) {
        case 0:
          return g.call(this);
        case 1:
          return f.call(this, m);
        case 2:
          return e.call(this, m, n);
        case 3:
          return d.call(this, m, n, q);
        default:
          var y = null;
          if (3 < arguments.length) {
            y = 0;
            for (var x = Array(arguments.length - 3); y < x.length;) {
              x[y] = arguments[y + 3], ++y;
            }
            y = new Fc(x, 0, null);
          }
          return l.m(m, n, q, y);
      }
      throw Error("Invalid arity: " + arguments.length);
    };
    k.C = 3;
    k.B = l.B;
    k.F = g;
    k.h = f;
    k.g = e;
    k.i = d;
    k.m = l.m;
    return k;
  }();
};
Pe.m = function(a, b, c, d) {
  var e = de(fd(a, fd(b, fd(c, d))));
  return function() {
    function f(k) {
      var l = null;
      if (0 < arguments.length) {
        l = 0;
        for (var m = Array(arguments.length - 0); l < m.length;) {
          m[l] = arguments[l + 0], ++l;
        }
        l = new Fc(m, 0, null);
      }
      return g.call(this, l);
    }
    function g(k) {
      k = Be(B(e), k);
      for (var l = C(e);;) {
        if (l) {
          var m = B(l);
          k = m.h ? m.h(k) : m.call(null, k);
          l = C(l);
        } else {
          return k;
        }
      }
    }
    f.C = 0;
    f.B = function(k) {
      k = A(k);
      return g(k);
    };
    f.m = g;
    return f;
  }();
};
Pe.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  var d = C(c);
  c = B(d);
  d = C(d);
  return this.m(b, a, c, d);
};
Pe.C = 3;
function Qe() {
  var a = Re;
  return function() {
    function b(k, l, m) {
      return a.L ? a.L(256, k, l, m) : a.call(null, 256, k, l, m);
    }
    function c(k, l) {
      return a.i ? a.i(256, k, l) : a.call(null, 256, k, l);
    }
    function d(k) {
      return a.g ? a.g(256, k) : a.call(null, 256, k);
    }
    function e() {
      return a.h ? a.h(256) : a.call(null, 256);
    }
    var f = null, g = function() {
      function k(m, n, q, v) {
        var y = null;
        if (3 < arguments.length) {
          y = 0;
          for (var x = Array(arguments.length - 3); y < x.length;) {
            x[y] = arguments[y + 3], ++y;
          }
          y = new Fc(x, 0, null);
        }
        return l.call(this, m, n, q, y);
      }
      function l(m, n, q, v) {
        return td(a, 256, m, n, q, gd([v]));
      }
      k.C = 3;
      k.B = function(m) {
        var n = B(m);
        m = C(m);
        var q = B(m);
        m = C(m);
        var v = B(m);
        m = Hc(m);
        return l(n, q, v, m);
      };
      k.m = l;
      return k;
    }();
    f = function(k, l, m, n) {
      switch(arguments.length) {
        case 0:
          return e.call(this);
        case 1:
          return d.call(this, k);
        case 2:
          return c.call(this, k, l);
        case 3:
          return b.call(this, k, l, m);
        default:
          var q = null;
          if (3 < arguments.length) {
            q = 0;
            for (var v = Array(arguments.length - 3); q < v.length;) {
              v[q] = arguments[q + 3], ++q;
            }
            q = new Fc(v, 0, null);
          }
          return g.m(k, l, m, q);
      }
      throw Error("Invalid arity: " + arguments.length);
    };
    f.C = 3;
    f.B = g.B;
    f.F = e;
    f.h = d;
    f.g = c;
    f.i = b;
    f.m = g.m;
    return f;
  }();
}
function Se(a, b, c) {
  var d = Te;
  return function() {
    function e(n, q, v) {
      return d.Ca ? d.Ca(a, b, c, n, q, v) : d.call(null, a, b, c, n, q, v);
    }
    function f(n, q) {
      return d.ea ? d.ea(a, b, c, n, q) : d.call(null, a, b, c, n, q);
    }
    function g(n) {
      return d.L ? d.L(a, b, c, n) : d.call(null, a, b, c, n);
    }
    function k() {
      return d.i ? d.i(a, b, c) : d.call(null, a, b, c);
    }
    var l = null, m = function() {
      function n(v, y, x, D) {
        var P = null;
        if (3 < arguments.length) {
          P = 0;
          for (var ea = Array(arguments.length - 3); P < ea.length;) {
            ea[P] = arguments[P + 3], ++P;
          }
          P = new Fc(ea, 0, null);
        }
        return q.call(this, v, y, x, P);
      }
      function q(v, y, x, D) {
        return td(d, a, b, c, v, gd([y, x, D]));
      }
      n.C = 3;
      n.B = function(v) {
        var y = B(v);
        v = C(v);
        var x = B(v);
        v = C(v);
        var D = B(v);
        v = Hc(v);
        return q(y, x, D, v);
      };
      n.m = q;
      return n;
    }();
    l = function(n, q, v, y) {
      switch(arguments.length) {
        case 0:
          return k.call(this);
        case 1:
          return g.call(this, n);
        case 2:
          return f.call(this, n, q);
        case 3:
          return e.call(this, n, q, v);
        default:
          var x = null;
          if (3 < arguments.length) {
            x = 0;
            for (var D = Array(arguments.length - 3); x < D.length;) {
              D[x] = arguments[x + 3], ++x;
            }
            x = new Fc(D, 0, null);
          }
          return m.m(n, q, v, x);
      }
      throw Error("Invalid arity: " + arguments.length);
    };
    l.C = 3;
    l.B = m.B;
    l.F = k;
    l.h = g;
    l.g = f;
    l.i = e;
    l.m = m.m;
    return l;
  }();
}
function Ue(a, b, c, d) {
  var e = Ve;
  return function() {
    function f(k) {
      var l = null;
      if (0 < arguments.length) {
        l = 0;
        for (var m = Array(arguments.length - 0); l < m.length;) {
          m[l] = arguments[l + 0], ++l;
        }
        l = new Fc(m, 0, null);
      }
      return g.call(this, l);
    }
    function g(k) {
      return Ce(e, a, b, c, te.g(d, k));
    }
    f.C = 0;
    f.B = function(k) {
      k = A(k);
      return g(k);
    };
    f.m = g;
    return f;
  }();
}
function We() {
  this.state = 1000;
  this.dc = this.Fc = this.v = null;
  this.G = 16386;
  this.o = 6455296;
}
h = We.prototype;
h.equiv = function(a) {
  return this.D(null, a);
};
h.D = function(a, b) {
  return this === b;
};
h.Rb = function() {
  return this.state;
};
h.U = function() {
  return this.v;
};
h.S = function() {
  return ca(this);
};
function Xe(a, b) {
  if (a instanceof We) {
    var c = a.Fc;
    if (null != c && !t(c.h ? c.h(b) : c.call(null, b))) {
      throw Error("Validator rejected reference state");
    }
    c = a.state;
    a.state = b;
    if (null != a.dc) {
      a: {
        for (var d = A(a.dc), e = null, f = 0, g = 0;;) {
          if (g < f) {
            var k = e.M(null, g), l = I(k, 0);
            k = I(k, 1);
            k.L ? k.L(l, a, c, b) : k.call(null, l, a, c, b);
            g += 1;
          } else {
            if (d = A(d)) {
              Dd(d) ? (e = ic(d), d = jc(d), l = e, f = H(e), e = l) : (e = B(d), l = I(e, 0), k = I(e, 1), k.L ? k.L(l, a, c, b) : k.call(null, l, a, c, b), d = C(d), e = null, f = 0), g = 0;
            } else {
              break a;
            }
          }
        }
      }
    }
    return b;
  }
  return kc(a, b);
}
var Ye = function Ye(a) {
  switch(arguments.length) {
    case 2:
      return Ye.g(arguments[0], arguments[1]);
    case 3:
      return Ye.i(arguments[0], arguments[1], arguments[2]);
    case 4:
      return Ye.L(arguments[0], arguments[1], arguments[2], arguments[3]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return Ye.m(arguments[0], arguments[1], arguments[2], arguments[3], new Fc(c.slice(4), 0, null));
  }
};
Ye.g = function(a, b) {
  if (a instanceof We) {
    var c = a.state;
    b = b.h ? b.h(c) : b.call(null, c);
    a = Xe(a, b);
  } else {
    a = lc.g(a, b);
  }
  return a;
};
Ye.i = function(a, b, c) {
  if (a instanceof We) {
    var d = a.state;
    b = b.g ? b.g(d, c) : b.call(null, d, c);
    a = Xe(a, b);
  } else {
    a = lc.i(a, b, c);
  }
  return a;
};
Ye.L = function(a, b, c, d) {
  if (a instanceof We) {
    var e = a.state;
    b = b.i ? b.i(e, c, d) : b.call(null, e, c, d);
    a = Xe(a, b);
  } else {
    a = lc.L(a, b, c, d);
  }
  return a;
};
Ye.m = function(a, b, c, d, e) {
  return a instanceof We ? Xe(a, Ce(b, a.state, c, d, e)) : lc.ea(a, b, c, d, e);
};
Ye.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  var d = C(c);
  c = B(d);
  var e = C(d);
  d = B(e);
  e = C(e);
  return this.m(b, a, c, d, e);
};
Ye.C = 4;
function Ze(a, b) {
  return function f(d, e) {
    return new ke(null, function() {
      var g = A(e);
      if (g) {
        if (Dd(g)) {
          for (var k = ic(g), l = H(k), m = new me(Array(l)), n = 0;;) {
            if (n < l) {
              var q = function() {
                var v = d + n, y = kb.g(k, n);
                return a.g ? a.g(v, y) : a.call(null, v, y);
              }();
              null != q && m.add(q);
              n += 1;
            } else {
              break;
            }
          }
          return pe(m.X(), f(d + l, jc(g)));
        }
        l = function() {
          var v = B(g);
          return a.g ? a.g(d, v) : a.call(null, d, v);
        }();
        return null == l ? f(d + 1, Hc(g)) : fd(l, f(d + 1, Hc(g)));
      }
      return null;
    }, null);
  }(0, b);
}
var $e = function $e(a) {
  switch(arguments.length) {
    case 1:
      return $e.h(arguments[0]);
    case 2:
      return $e.g(arguments[0], arguments[1]);
    case 3:
      return $e.i(arguments[0], arguments[1], arguments[2]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return $e.m(arguments[0], arguments[1], arguments[2], new Fc(c.slice(3), 0, null));
  }
};
$e.h = function(a) {
  return function() {
    function b(g, k, l) {
      g = a.h ? a.h(g) : a.call(null, g);
      t(g) ? (k = a.h ? a.h(k) : a.call(null, k), l = t(k) ? a.h ? a.h(l) : a.call(null, l) : k) : l = g;
      return Gd(l);
    }
    function c(g, k) {
      g = a.h ? a.h(g) : a.call(null, g);
      k = t(g) ? a.h ? a.h(k) : a.call(null, k) : g;
      return Gd(k);
    }
    function d(g) {
      return Gd(a.h ? a.h(g) : a.call(null, g));
    }
    var e = null, f = function() {
      function g(l, m, n, q) {
        var v = null;
        if (3 < arguments.length) {
          v = 0;
          for (var y = Array(arguments.length - 3); v < y.length;) {
            y[v] = arguments[v + 3], ++v;
          }
          v = new Fc(y, 0, null);
        }
        return k.call(this, l, m, n, v);
      }
      function k(l, m, n, q) {
        l = e.i(l, m, n);
        q = t(l) ? Ke(a, q) : l;
        return Gd(q);
      }
      g.C = 3;
      g.B = function(l) {
        var m = B(l);
        l = C(l);
        var n = B(l);
        l = C(l);
        var q = B(l);
        l = Hc(l);
        return k(m, n, q, l);
      };
      g.m = k;
      return g;
    }();
    e = function(g, k, l, m) {
      switch(arguments.length) {
        case 0:
          return !0;
        case 1:
          return d.call(this, g);
        case 2:
          return c.call(this, g, k);
        case 3:
          return b.call(this, g, k, l);
        default:
          var n = null;
          if (3 < arguments.length) {
            n = 0;
            for (var q = Array(arguments.length - 3); n < q.length;) {
              q[n] = arguments[n + 3], ++n;
            }
            n = new Fc(q, 0, null);
          }
          return f.m(g, k, l, n);
      }
      throw Error("Invalid arity: " + arguments.length);
    };
    e.C = 3;
    e.B = f.B;
    e.F = function() {
      return !0;
    };
    e.h = d;
    e.g = c;
    e.i = b;
    e.m = f.m;
    return e;
  }();
};
$e.g = function(a, b) {
  return function() {
    function c(k, l, m) {
      return Gd(function() {
        var n = a.h ? a.h(k) : a.call(null, k);
        return t(n) ? (n = a.h ? a.h(l) : a.call(null, l), t(n) ? (n = a.h ? a.h(m) : a.call(null, m), t(n) ? (n = b.h ? b.h(k) : b.call(null, k), t(n) ? (n = b.h ? b.h(l) : b.call(null, l), t(n) ? b.h ? b.h(m) : b.call(null, m) : n) : n) : n) : n) : n;
      }());
    }
    function d(k, l) {
      return Gd(function() {
        var m = a.h ? a.h(k) : a.call(null, k);
        return t(m) ? (m = a.h ? a.h(l) : a.call(null, l), t(m) ? (m = b.h ? b.h(k) : b.call(null, k), t(m) ? b.h ? b.h(l) : b.call(null, l) : m) : m) : m;
      }());
    }
    function e(k) {
      var l = a.h ? a.h(k) : a.call(null, k);
      k = t(l) ? b.h ? b.h(k) : b.call(null, k) : l;
      return Gd(k);
    }
    var f = null, g = function() {
      function k(m, n, q, v) {
        var y = null;
        if (3 < arguments.length) {
          y = 0;
          for (var x = Array(arguments.length - 3); y < x.length;) {
            x[y] = arguments[y + 3], ++y;
          }
          y = new Fc(x, 0, null);
        }
        return l.call(this, m, n, q, y);
      }
      function l(m, n, q, v) {
        return Gd(function() {
          var y = f.i(m, n, q);
          return t(y) ? Ke(function(x) {
            var D = a.h ? a.h(x) : a.call(null, x);
            return t(D) ? b.h ? b.h(x) : b.call(null, x) : D;
          }, v) : y;
        }());
      }
      k.C = 3;
      k.B = function(m) {
        var n = B(m);
        m = C(m);
        var q = B(m);
        m = C(m);
        var v = B(m);
        m = Hc(m);
        return l(n, q, v, m);
      };
      k.m = l;
      return k;
    }();
    f = function(k, l, m, n) {
      switch(arguments.length) {
        case 0:
          return !0;
        case 1:
          return e.call(this, k);
        case 2:
          return d.call(this, k, l);
        case 3:
          return c.call(this, k, l, m);
        default:
          var q = null;
          if (3 < arguments.length) {
            q = 0;
            for (var v = Array(arguments.length - 3); q < v.length;) {
              v[q] = arguments[q + 3], ++q;
            }
            q = new Fc(v, 0, null);
          }
          return g.m(k, l, m, q);
      }
      throw Error("Invalid arity: " + arguments.length);
    };
    f.C = 3;
    f.B = g.B;
    f.F = function() {
      return !0;
    };
    f.h = e;
    f.g = d;
    f.i = c;
    f.m = g.m;
    return f;
  }();
};
$e.i = function(a, b, c) {
  return function() {
    function d(l, m, n) {
      return Gd(function() {
        var q = a.h ? a.h(l) : a.call(null, l);
        return t(q) ? (q = b.h ? b.h(l) : b.call(null, l), t(q) ? (q = c.h ? c.h(l) : c.call(null, l), t(q) ? (q = a.h ? a.h(m) : a.call(null, m), t(q) ? (q = b.h ? b.h(m) : b.call(null, m), t(q) ? (q = c.h ? c.h(m) : c.call(null, m), t(q) ? (q = a.h ? a.h(n) : a.call(null, n), t(q) ? (q = b.h ? b.h(n) : b.call(null, n), t(q) ? c.h ? c.h(n) : c.call(null, n) : q) : q) : q) : q) : q) : q) : q) : q;
      }());
    }
    function e(l, m) {
      return Gd(function() {
        var n = a.h ? a.h(l) : a.call(null, l);
        return t(n) ? (n = b.h ? b.h(l) : b.call(null, l), t(n) ? (n = c.h ? c.h(l) : c.call(null, l), t(n) ? (n = a.h ? a.h(m) : a.call(null, m), t(n) ? (n = b.h ? b.h(m) : b.call(null, m), t(n) ? c.h ? c.h(m) : c.call(null, m) : n) : n) : n) : n) : n;
      }());
    }
    function f(l) {
      var m = a.h ? a.h(l) : a.call(null, l);
      t(m) ? (m = b.h ? b.h(l) : b.call(null, l), l = t(m) ? c.h ? c.h(l) : c.call(null, l) : m) : l = m;
      return Gd(l);
    }
    var g = null, k = function() {
      function l(n, q, v, y) {
        var x = null;
        if (3 < arguments.length) {
          x = 0;
          for (var D = Array(arguments.length - 3); x < D.length;) {
            D[x] = arguments[x + 3], ++x;
          }
          x = new Fc(D, 0, null);
        }
        return m.call(this, n, q, v, x);
      }
      function m(n, q, v, y) {
        return Gd(function() {
          var x = g.i(n, q, v);
          return t(x) ? Ke(function(D) {
            var P = a.h ? a.h(D) : a.call(null, D);
            return t(P) ? (P = b.h ? b.h(D) : b.call(null, D), t(P) ? c.h ? c.h(D) : c.call(null, D) : P) : P;
          }, y) : x;
        }());
      }
      l.C = 3;
      l.B = function(n) {
        var q = B(n);
        n = C(n);
        var v = B(n);
        n = C(n);
        var y = B(n);
        n = Hc(n);
        return m(q, v, y, n);
      };
      l.m = m;
      return l;
    }();
    g = function(l, m, n, q) {
      switch(arguments.length) {
        case 0:
          return !0;
        case 1:
          return f.call(this, l);
        case 2:
          return e.call(this, l, m);
        case 3:
          return d.call(this, l, m, n);
        default:
          var v = null;
          if (3 < arguments.length) {
            v = 0;
            for (var y = Array(arguments.length - 3); v < y.length;) {
              y[v] = arguments[v + 3], ++v;
            }
            v = new Fc(y, 0, null);
          }
          return k.m(l, m, n, v);
      }
      throw Error("Invalid arity: " + arguments.length);
    };
    g.C = 3;
    g.B = k.B;
    g.F = function() {
      return !0;
    };
    g.h = f;
    g.g = e;
    g.i = d;
    g.m = k.m;
    return g;
  }();
};
$e.m = function(a, b, c, d) {
  var e = fd(a, fd(b, fd(c, d)));
  return function() {
    function f(n, q, v) {
      return Ke(function(y) {
        var x = y.h ? y.h(n) : y.call(null, n);
        return t(x) ? (x = y.h ? y.h(q) : y.call(null, q), t(x) ? y.h ? y.h(v) : y.call(null, v) : x) : x;
      }, e);
    }
    function g(n, q) {
      return Ke(function(v) {
        var y = v.h ? v.h(n) : v.call(null, n);
        return t(y) ? v.h ? v.h(q) : v.call(null, q) : y;
      }, e);
    }
    function k(n) {
      return Ke(function(q) {
        return q.h ? q.h(n) : q.call(null, n);
      }, e);
    }
    var l = null, m = function() {
      function n(v, y, x, D) {
        var P = null;
        if (3 < arguments.length) {
          P = 0;
          for (var ea = Array(arguments.length - 3); P < ea.length;) {
            ea[P] = arguments[P + 3], ++P;
          }
          P = new Fc(ea, 0, null);
        }
        return q.call(this, v, y, x, P);
      }
      function q(v, y, x, D) {
        return Gd(function() {
          var P = l.i(v, y, x);
          return t(P) ? Ke(function(ea) {
            return Ke(ea, D);
          }, e) : P;
        }());
      }
      n.C = 3;
      n.B = function(v) {
        var y = B(v);
        v = C(v);
        var x = B(v);
        v = C(v);
        var D = B(v);
        v = Hc(v);
        return q(y, x, D, v);
      };
      n.m = q;
      return n;
    }();
    l = function(n, q, v, y) {
      switch(arguments.length) {
        case 0:
          return !0;
        case 1:
          return k.call(this, n);
        case 2:
          return g.call(this, n, q);
        case 3:
          return f.call(this, n, q, v);
        default:
          var x = null;
          if (3 < arguments.length) {
            x = 0;
            for (var D = Array(arguments.length - 3); x < D.length;) {
              D[x] = arguments[x + 3], ++x;
            }
            x = new Fc(D, 0, null);
          }
          return m.m(n, q, v, x);
      }
      throw Error("Invalid arity: " + arguments.length);
    };
    l.C = 3;
    l.B = m.B;
    l.F = function() {
      return !0;
    };
    l.h = k;
    l.g = g;
    l.i = f;
    l.m = m.m;
    return l;
  }();
};
$e.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  var d = C(c);
  c = B(d);
  d = C(d);
  return this.m(b, a, c, d);
};
$e.C = 3;
var af = function af(a) {
  switch(arguments.length) {
    case 1:
      return af.h(arguments[0]);
    case 2:
      return af.g(arguments[0], arguments[1]);
    case 3:
      return af.i(arguments[0], arguments[1], arguments[2]);
    case 4:
      return af.L(arguments[0], arguments[1], arguments[2], arguments[3]);
    default:
      for (var c = [], d = arguments.length, e = 0;;) {
        if (e < d) {
          c.push(arguments[e]), e += 1;
        } else {
          break;
        }
      }
      return af.m(arguments[0], arguments[1], arguments[2], arguments[3], new Fc(c.slice(4), 0, null));
  }
};
af.h = function(a) {
  return function(b) {
    return function() {
      function c(k, l) {
        l = a.h ? a.h(l) : a.call(null, l);
        return b.g ? b.g(k, l) : b.call(null, k, l);
      }
      function d(k) {
        return b.h ? b.h(k) : b.call(null, k);
      }
      function e() {
        return b.F ? b.F() : b.call(null);
      }
      var f = null, g = function() {
        function k(m, n, q) {
          var v = null;
          if (2 < arguments.length) {
            v = 0;
            for (var y = Array(arguments.length - 2); v < y.length;) {
              y[v] = arguments[v + 2], ++v;
            }
            v = new Fc(y, 0, null);
          }
          return l.call(this, m, n, v);
        }
        function l(m, n, q) {
          if (a.B) {
            n = fd(n, q);
            var v = a.C;
            q = re(v, q) + 1;
            q = q <= v ? ve(a, q, n) : a.B(n);
          } else {
            q = xe(a, n, A(q));
          }
          return b.g ? b.g(m, q) : b.call(null, m, q);
        }
        k.C = 2;
        k.B = function(m) {
          var n = B(m);
          m = C(m);
          var q = B(m);
          m = Hc(m);
          return l(n, q, m);
        };
        k.m = l;
        return k;
      }();
      f = function(k, l, m) {
        switch(arguments.length) {
          case 0:
            return e.call(this);
          case 1:
            return d.call(this, k);
          case 2:
            return c.call(this, k, l);
          default:
            var n = null;
            if (2 < arguments.length) {
              n = 0;
              for (var q = Array(arguments.length - 2); n < q.length;) {
                q[n] = arguments[n + 2], ++n;
              }
              n = new Fc(q, 0, null);
            }
            return g.m(k, l, n);
        }
        throw Error("Invalid arity: " + arguments.length);
      };
      f.C = 2;
      f.B = g.B;
      f.F = e;
      f.h = d;
      f.g = c;
      f.m = g.m;
      return f;
    }();
  };
};
af.g = function(a, b) {
  return new ke(null, function() {
    var c = A(b);
    if (c) {
      if (Dd(c)) {
        for (var d = ic(c), e = H(d), f = new me(Array(e)), g = 0;;) {
          if (g < e) {
            qe(f, function() {
              var k = kb.g(d, g);
              return a.h ? a.h(k) : a.call(null, k);
            }()), g += 1;
          } else {
            break;
          }
        }
        return pe(f.X(), af.g(a, jc(c)));
      }
      return fd(function() {
        var k = B(c);
        return a.h ? a.h(k) : a.call(null, k);
      }(), af.g(a, Hc(c)));
    }
    return null;
  }, null);
};
af.i = function(a, b, c) {
  return new ke(null, function() {
    var d = A(b), e = A(c);
    if (d && e) {
      var f = B(d);
      var g = B(e);
      f = a.g ? a.g(f, g) : a.call(null, f, g);
      d = fd(f, af.i(a, Hc(d), Hc(e)));
    } else {
      d = null;
    }
    return d;
  }, null);
};
af.L = function(a, b, c, d) {
  return new ke(null, function() {
    var e = A(b), f = A(c), g = A(d);
    if (e && f && g) {
      var k = B(e);
      var l = B(f), m = B(g);
      k = a.i ? a.i(k, l, m) : a.call(null, k, l, m);
      e = fd(k, af.L(a, Hc(e), Hc(f), Hc(g)));
    } else {
      e = null;
    }
    return e;
  }, null);
};
af.m = function(a, b, c, d, e) {
  return af.g(function(f) {
    return Be(a, f);
  }, function k(g) {
    return new ke(null, function() {
      var l = af.g(A, g);
      return Ke(Td, l) ? fd(af.g(B, l), k(af.g(Hc, l))) : null;
    }, null);
  }(jd.m(e, d, gd([c, b]))));
};
af.B = function(a) {
  var b = B(a), c = C(a);
  a = B(c);
  var d = C(c);
  c = B(d);
  var e = C(d);
  d = B(e);
  e = C(e);
  return this.m(b, a, c, d, e);
};
af.C = 4;
function bf(a, b) {
  if ("number" !== typeof a) {
    throw Error("Assert failed: (number? n)");
  }
  return new ke(null, function() {
    if (0 < a) {
      var c = A(b);
      return c ? fd(B(c), bf(a - 1, Hc(c))) : null;
    }
    return null;
  }, null);
}
function cf(a, b) {
  if ("number" !== typeof a) {
    throw Error("Assert failed: (number? n)");
  }
  return new ke(null, function() {
    a: {
      for (var c = a, d = b;;) {
        if (d = A(d), 0 < c && d) {
          --c, d = Hc(d);
        } else {
          break a;
        }
      }
    }
    return d;
  }, null);
}
function df(a) {
  return af.i(function(b) {
    return b;
  }, a, cf(2, a));
}
function ef(a, b, c, d) {
  this.v = a;
  this.count = b;
  this.I = c;
  this.next = d;
  this.A = null;
  this.o = 32374988;
  this.G = 1;
}
h = ef.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, this.count);
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  return null == this.next ? 1 < this.count ? this.next = new ef(null, this.count - 1, this.I, null) : -1 === this.count ? this : null : this.next;
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  if (-1 === this.count) {
    for (var c = b.g ? b.g(this.I, this.I) : b.call(null, this.I, this.I);;) {
      if (Tc(c)) {
        return Gb(c);
      }
      c = b.g ? b.g(c, this.I) : b.call(null, c, this.I);
    }
  } else {
    for (a = 1, c = this.I;;) {
      if (a < this.count) {
        c = b.g ? b.g(c, this.I) : b.call(null, c, this.I);
        if (Tc(c)) {
          return Gb(c);
        }
        a += 1;
      } else {
        return c;
      }
    }
  }
};
h.ga = function(a, b, c) {
  if (-1 === this.count) {
    for (c = b.g ? b.g(c, this.I) : b.call(null, c, this.I);;) {
      if (Tc(c)) {
        return Gb(c);
      }
      c = b.g ? b.g(c, this.I) : b.call(null, c, this.I);
    }
  } else {
    for (a = 0;;) {
      if (a < this.count) {
        c = b.g ? b.g(c, this.I) : b.call(null, c, this.I);
        if (Tc(c)) {
          return Gb(c);
        }
        a += 1;
      } else {
        return c;
      }
    }
  }
};
h.ha = function() {
  return this.I;
};
h.ja = function() {
  return null == this.next ? 1 < this.count ? this.next = new ef(null, this.count - 1, this.I, null) : -1 === this.count ? this : Ic : this.next;
};
h.P = function() {
  return this;
};
h.V = function(a, b) {
  return b === this.v ? this : new ef(b, this.count, this.I, this.next);
};
h.Y = function(a, b) {
  return fd(b, this);
};
function ff(a, b) {
  return new ke(null, function() {
    var c = A(b);
    if (c) {
      if (Dd(c)) {
        for (var d = ic(c), e = H(d), f = new me(Array(e)), g = 0;;) {
          if (g < e) {
            var k = kb.g(d, g);
            k = a.h ? a.h(k) : a.call(null, k);
            t(k) && (k = kb.g(d, g), f.add(k));
            g += 1;
          } else {
            break;
          }
        }
        return pe(f.X(), ff(a, jc(c)));
      }
      d = B(c);
      c = Hc(c);
      return t(a.h ? a.h(d) : a.call(null, d)) ? fd(d, ff(a, c)) : ff(a, c);
    }
    return null;
  }, null);
}
function gf(a, b) {
  return ff(Ne(a), b);
}
function hf(a, b) {
  return null != a ? null != a && (a.G & 4 || p === a.ic) ? Jb(cc(ab(bc, ac(a), b)), vd(a)) : ab(ib, a, b) : ab(jd, a, b);
}
function jf(a, b, c) {
  return null != a && (a.G & 4 || p === a.ic) ? Jb(cc(Ud(b, ue, ac(a), c)), vd(a)) : Ud(b, jd, a, c);
}
function kf(a, b) {
  return cc(ab(function(c, d) {
    return ue.g(c, a.h ? a.h(d) : a.call(null, d));
  }, ac(ld), b));
}
function lf(a, b) {
  return cc(ab(function(c, d) {
    return t(a.h ? a.h(d) : a.call(null, d)) ? ue.g(c, d) : c;
  }, ac(ld), b));
}
function mf(a, b) {
  return nf(a, a, b);
}
function nf(a, b, c) {
  return new ke(null, function() {
    var d = A(c);
    if (d) {
      var e = bf(a, d);
      return a === H(e) ? fd(e, nf(a, b, cf(b, d))) : null;
    }
    return null;
  }, null);
}
function of(a, b) {
  this.R = a;
  this.j = b;
}
function pf(a) {
  return new of(a, [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
}
function qf(a) {
  return new of(a.R, Za(a.j));
}
function rf(a) {
  a = a.s;
  return 32 > a ? 0 : a - 1 >>> 5 << 5;
}
function sf(a, b, c) {
  for (;;) {
    if (0 === b) {
      return c;
    }
    var d = pf(a);
    d.j[0] = c;
    c = d;
    b -= 5;
  }
}
var tf = function tf(a, b, c, d) {
  var f = qf(c), g = a.s - 1 >>> b & 31;
  5 === b ? f.j[g] = d : (c = c.j[g], null != c ? (b -= 5, a = tf.L ? tf.L(a, b, c, d) : tf.call(null, a, b, c, d)) : a = sf(null, b - 5, d), f.j[g] = a);
  return f;
};
function uf(a, b) {
  throw Error(["No item ", u.h(a), " in vector of length ", u.h(b)].join(""));
}
function vf(a, b) {
  if (b >= rf(a)) {
    return a.xa;
  }
  var c = a.root;
  for (a = a.shift;;) {
    if (0 < a) {
      var d = a - 5;
      c = c.j[b >>> a & 31];
      a = d;
    } else {
      return c.j;
    }
  }
}
var wf = function wf(a, b, c, d, e) {
  var g = qf(c);
  if (0 === b) {
    g.j[d & 31] = e;
  } else {
    var k = d >>> b & 31;
    b -= 5;
    c = c.j[k];
    a = wf.ea ? wf.ea(a, b, c, d, e) : wf.call(null, a, b, c, d, e);
    g.j[k] = a;
  }
  return g;
}, xf = function xf(a, b, c) {
  var e = a.s - 2 >>> b & 31;
  if (5 < b) {
    b -= 5;
    var f = c.j[e];
    a = xf.i ? xf.i(a, b, f) : xf.call(null, a, b, f);
    if (null == a && 0 === e) {
      return null;
    }
    c = qf(c);
    c.j[e] = a;
    return c;
  }
  if (0 === e) {
    return null;
  }
  c = qf(c);
  c.j[e] = null;
  return c;
};
function yf(a, b, c, d, e, f) {
  this.u = a;
  this.Nb = b;
  this.j = c;
  this.ia = d;
  this.start = e;
  this.end = f;
}
yf.prototype.ca = function() {
  return this.u < this.end;
};
yf.prototype.next = function() {
  32 === this.u - this.Nb && (this.j = vf(this.ia, this.u), this.Nb += 32);
  var a = this.j[this.u & 31];
  this.u += 1;
  return a;
};
function zf(a, b, c) {
  return new yf(b, b - b % 32, b < H(a) ? vf(a, b) : null, a, b, c);
}
function Af(a, b, c, d) {
  return c < d ? Bf(a, b, ad(a, c), c + 1, d) : b.F ? b.F() : b.call(null);
}
function Bf(a, b, c, d, e) {
  var f = c;
  c = d;
  for (d = vf(a, d);;) {
    if (c < e) {
      var g = c & 31;
      d = 0 === g ? vf(a, c) : d;
      g = d[g];
      f = b.g ? b.g(f, g) : b.call(null, f, g);
      if (Tc(f)) {
        return Gb(f);
      }
      c += 1;
    } else {
      return f;
    }
  }
}
function K(a, b, c, d, e, f) {
  this.v = a;
  this.s = b;
  this.shift = c;
  this.root = d;
  this.xa = e;
  this.A = f;
  this.o = 167666463;
  this.G = 139268;
}
h = K.prototype;
h.ob = function(a, b) {
  return 0 <= b && b < this.s ? new Cf(b, vf(this, b)[b & 31]) : null;
};
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.T = function(a, b) {
  return this.H(null, b, null);
};
h.H = function(a, b, c) {
  return "number" === typeof b ? this.aa(null, b, c) : c;
};
h.pb = function(a, b, c) {
  a = 0;
  for (var d = c;;) {
    if (a < this.s) {
      var e = vf(this, a);
      c = e.length;
      a: {
        for (var f = 0;;) {
          if (f < c) {
            var g = f + a, k = e[f];
            d = b.i ? b.i(d, g, k) : b.call(null, d, g, k);
            if (Tc(d)) {
              e = d;
              break a;
            }
            f += 1;
          } else {
            e = d;
            break a;
          }
        }
      }
      if (Tc(e)) {
        return Gb(e);
      }
      a += c;
      d = e;
    } else {
      return d;
    }
  }
};
h.Pb = p;
h.M = function(a, b) {
  return (0 <= b && b < this.s ? vf(this, b) : uf(b, this.s))[b & 31];
};
h.aa = function(a, b, c) {
  return 0 <= b && b < this.s ? vf(this, b)[b & 31] : c;
};
h.jb = function(a, b, c) {
  if (0 <= b && b < this.s) {
    return rf(this) <= b ? (a = Za(this.xa), a[b & 31] = c, new K(this.v, this.s, this.shift, this.root, a, null)) : new K(this.v, this.s, this.shift, wf(this, this.shift, this.root, b, c), this.xa, null);
  }
  if (b === this.s) {
    return this.Y(null, c);
  }
  throw Error(["Index ", u.h(b), " out of bounds  [0,", u.h(this.s), "]"].join(""));
};
h.za = function() {
  return zf(this, 0, this.s);
};
h.U = function() {
  return this.v;
};
h.N = function() {
  return this.s;
};
h.rb = function() {
  return 0 < this.s ? this.M(null, this.s - 1) : null;
};
h.sb = function() {
  if (0 === this.s) {
    throw Error("Can't pop empty vector");
  }
  if (1 === this.s) {
    return Jb(ld, this.v);
  }
  if (1 < this.s - rf(this)) {
    return new K(this.v, this.s - 1, this.shift, this.root, this.xa.slice(0, -1), null);
  }
  var a = vf(this, this.s - 2), b = xf(this, this.shift, this.root);
  b = null == b ? L : b;
  var c = this.s - 1;
  return 5 < this.shift && null == b.j[1] ? new K(this.v, c, this.shift - 5, b.j[0], a, null) : new K(this.v, c, this.shift, b, a, null);
};
h.Ab = function() {
  return 0 < this.s ? new dd(this, this.s - 1, null) : null;
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  if (b instanceof K) {
    if (this.s === H(b)) {
      for (a = this.za(null), b = b.za(null);;) {
        if (a.ca()) {
          var c = a.next(), d = b.next();
          if (!E.g(c, d)) {
            return !1;
          }
        } else {
          return !0;
        }
      }
    } else {
      return !1;
    }
  } else {
    return ed(this, b);
  }
};
h.nb = function() {
  var a = this.s, b = this.shift, c = new of({}, Za(this.root.j)), d = this.xa, e = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
  Ed(d, 0, e, 0, d.length);
  return new Df(a, b, c, e);
};
h.$ = function() {
  return Jb(ld, this.v);
};
h.fa = function(a, b) {
  return Af(this, b, 0, this.s);
};
h.ga = function(a, b, c) {
  a = 0;
  for (var d = c;;) {
    if (a < this.s) {
      var e = vf(this, a);
      c = e.length;
      a: {
        for (var f = 0;;) {
          if (f < c) {
            var g = e[f];
            d = b.g ? b.g(d, g) : b.call(null, d, g);
            if (Tc(d)) {
              e = d;
              break a;
            }
            f += 1;
          } else {
            e = d;
            break a;
          }
        }
      }
      if (Tc(e)) {
        return Gb(e);
      }
      a += c;
      d = e;
    } else {
      return d;
    }
  }
};
h.Ba = function(a, b, c) {
  if ("number" === typeof b) {
    return this.jb(null, b, c);
  }
  throw Error("Vector's key for assoc must be a number.");
};
h.ab = function(a, b) {
  return Hd(b) ? 0 <= b && b < this.s : !1;
};
h.P = function() {
  if (0 === this.s) {
    var a = null;
  } else {
    if (32 >= this.s) {
      a = new Fc(this.xa, 0, null);
    } else {
      a: {
        a = this.root;
        for (var b = this.shift;;) {
          if (0 < b) {
            b -= 5, a = a.j[0];
          } else {
            a = a.j;
            break a;
          }
        }
      }
      a = new Ef(this, a, 0, 0, null);
    }
  }
  return a;
};
h.V = function(a, b) {
  return b === this.v ? this : new K(b, this.s, this.shift, this.root, this.xa, this.A);
};
h.Y = function(a, b) {
  if (32 > this.s - rf(this)) {
    a = this.xa.length;
    for (var c = Array(a + 1), d = 0;;) {
      if (d < a) {
        c[d] = this.xa[d], d += 1;
      } else {
        break;
      }
    }
    c[a] = b;
    return new K(this.v, this.s + 1, this.shift, this.root, c, null);
  }
  a = (c = this.s >>> 5 > 1 << this.shift) ? this.shift + 5 : this.shift;
  c ? (c = pf(null), c.j[0] = this.root, d = sf(null, this.shift, new of(null, this.xa)), c.j[1] = d) : c = tf(this, this.shift, this.root, new of(null, this.xa));
  return new K(this.v, this.s + 1, a, c, [b], null);
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return this.M(null, c);
      case 3:
        return this.aa(null, c, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return this.M(null, c);
  };
  a.i = function(b, c, d) {
    return this.aa(null, c, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return this.M(null, a);
};
h.g = function(a, b) {
  return this.aa(null, a, b);
};
var L = new of(null, [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]), ld = new K(null, 0, 5, L, [], Oc);
function M(a) {
  var b = a.length;
  if (32 > b) {
    return new K(null, b, 5, L, a, null);
  }
  for (var c = 32, d = (new K(null, 32, 5, L, a.slice(0, 32), null)).nb(null);;) {
    if (c < b) {
      var e = c + 1;
      d = ue.g(d, a[c]);
      c = e;
    } else {
      return cc(d);
    }
  }
}
K.prototype[Ya] = function() {
  return Kc(this);
};
function Ff(a) {
  return Gf(a) ? new K(null, 2, 5, L, [zb(a), Ab(a)], null) : Cd(a) ? ud(a, null) : Ra(a) ? M(a) : cc(ab(bc, ac(ld), a));
}
function Ef(a, b, c, d, e) {
  this.Aa = a;
  this.node = b;
  this.u = c;
  this.sa = d;
  this.v = e;
  this.A = null;
  this.o = 32375020;
  this.G = 1536;
}
h = Ef.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  if (this.sa + 1 < this.node.length) {
    var a = new Ef(this.Aa, this.node, this.u, this.sa + 1, null);
    return null == a ? null : a;
  }
  return this.Kb();
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return Af(this.Aa, b, this.u + this.sa, H(this.Aa));
};
h.ga = function(a, b, c) {
  return Bf(this.Aa, b, c, this.u + this.sa, H(this.Aa));
};
h.ha = function() {
  return this.node[this.sa];
};
h.ja = function() {
  if (this.sa + 1 < this.node.length) {
    var a = new Ef(this.Aa, this.node, this.u, this.sa + 1, null);
    return null == a ? Ic : a;
  }
  return this.bb(null);
};
h.P = function() {
  return this;
};
h.yb = function() {
  var a = this.node;
  return new ne(a, this.sa, a.length);
};
h.bb = function() {
  var a = this.u + this.node.length;
  return a < eb(this.Aa) ? new Ef(this.Aa, vf(this.Aa, a), a, 0, null) : Ic;
};
h.V = function(a, b) {
  return b === this.v ? this : new Ef(this.Aa, this.node, this.u, this.sa, b);
};
h.Y = function(a, b) {
  return fd(b, this);
};
h.Kb = function() {
  var a = this.u + this.node.length;
  return a < eb(this.Aa) ? new Ef(this.Aa, vf(this.Aa, a), a, 0, null) : null;
};
Ef.prototype[Ya] = function() {
  return Kc(this);
};
function Hf(a, b, c, d, e) {
  this.v = a;
  this.ia = b;
  this.start = c;
  this.end = d;
  this.A = e;
  this.o = 167666463;
  this.G = 139264;
}
h = Hf.prototype;
h.ob = function(a, b) {
  if (0 > b) {
    return null;
  }
  a = this.start + b;
  return a < this.end ? new Cf(b, rb.g(this.ia, a)) : null;
};
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.T = function(a, b) {
  return this.H(null, b, null);
};
h.H = function(a, b, c) {
  return "number" === typeof b ? this.aa(null, b, c) : c;
};
h.pb = function(a, b, c) {
  a = this.start;
  for (var d = 0;;) {
    if (a < this.end) {
      var e = d, f = kb.g(this.ia, a);
      c = b.i ? b.i(c, e, f) : b.call(null, c, e, f);
      if (Tc(c)) {
        return Gb(c);
      }
      d += 1;
      a += 1;
    } else {
      return c;
    }
  }
};
h.M = function(a, b) {
  return 0 > b || this.end <= this.start + b ? uf(b, this.end - this.start) : kb.g(this.ia, this.start + b);
};
h.aa = function(a, b, c) {
  return 0 > b || this.end <= this.start + b ? c : kb.i(this.ia, this.start + b, c);
};
h.jb = function(a, b, c) {
  a = this.start + b;
  if (0 > b || this.end + 1 <= a) {
    throw Error(["Index ", u.h(b), " out of bounds [0,", u.h(this.N(null)), "]"].join(""));
  }
  b = this.v;
  c = pd.i(this.ia, a, c);
  var d = this.end;
  a += 1;
  return If(b, c, this.start, d > a ? d : a, null);
};
h.za = function() {
  return null != this.ia && p === this.ia.Pb ? zf(this.ia, this.start, this.end) : new Je(this);
};
h.U = function() {
  return this.v;
};
h.N = function() {
  return this.end - this.start;
};
h.rb = function() {
  return this.start === this.end ? null : kb.g(this.ia, this.end - 1);
};
h.sb = function() {
  if (this.start === this.end) {
    throw Error("Can't pop empty vector");
  }
  return If(this.v, this.ia, this.start, this.end - 1, null);
};
h.Ab = function() {
  return this.start !== this.end ? new dd(this, this.end - this.start - 1, null) : null;
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Jb(ld, this.v);
};
h.fa = function(a, b) {
  return null != this.ia && p === this.ia.Pb ? Af(this.ia, b, this.start, this.end) : Uc(this, b);
};
h.ga = function(a, b, c) {
  return null != this.ia && p === this.ia.Pb ? Bf(this.ia, b, c, this.start, this.end) : Vc(this, b, c);
};
h.Ba = function(a, b, c) {
  if ("number" === typeof b) {
    return this.jb(null, b, c);
  }
  throw Error("Subvec's key for assoc must be a number.");
};
h.ab = function(a, b) {
  return Hd(b) ? 0 <= b && b < this.end - this.start : !1;
};
h.P = function() {
  var a = this;
  return function d(c) {
    return c === a.end ? null : fd(kb.g(a.ia, c), new ke(null, function() {
      return d(c + 1);
    }, null));
  }(a.start);
};
h.V = function(a, b) {
  return b === this.v ? this : If(b, this.ia, this.start, this.end, this.A);
};
h.Y = function(a, b) {
  return If(this.v, Fb(this.ia, this.end, b), this.start, this.end + 1, null);
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return this.M(null, c);
      case 3:
        return this.aa(null, c, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return this.M(null, c);
  };
  a.i = function(b, c, d) {
    return this.aa(null, c, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return this.M(null, a);
};
h.g = function(a, b) {
  return this.aa(null, a, b);
};
Hf.prototype[Ya] = function() {
  return Kc(this);
};
function If(a, b, c, d, e) {
  for (;;) {
    if (b instanceof Hf) {
      c = b.start + c, d = b.start + d, b = b.ia;
    } else {
      if (!Cd(b)) {
        throw Error("v must satisfy IVector");
      }
      if (0 > c || d < c || d > H(b)) {
        throw Error("Index out of bounds");
      }
      return new Hf(a, b, c, d, e);
    }
  }
}
function Jf(a, b, c) {
  if (null == b || null == c) {
    throw Error("Assert failed: (and (not (nil? start)) (not (nil? end)))");
  }
  return If(null, a, b | 0, c | 0, null);
}
function Kf(a, b) {
  return a === b.R ? b : new of(a, Za(b.j));
}
var Lf = function Lf(a, b, c, d) {
  c = Kf(a.root.R, c);
  var f = a.s - 1 >>> b & 31;
  if (5 === b) {
    a = d;
  } else {
    var g = c.j[f];
    null != g ? (b -= 5, a = Lf.L ? Lf.L(a, b, g, d) : Lf.call(null, a, b, g, d)) : a = sf(a.root.R, b - 5, d);
  }
  c.j[f] = a;
  return c;
};
function Df(a, b, c, d) {
  this.s = a;
  this.shift = b;
  this.root = c;
  this.xa = d;
  this.G = 88;
  this.o = 275;
}
h = Df.prototype;
h.ub = function(a, b) {
  if (this.root.R) {
    if (32 > this.s - rf(this)) {
      this.xa[this.s & 31] = b;
    } else {
      a = new of(this.root.R, this.xa);
      var c = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
      c[0] = b;
      this.xa = c;
      this.s >>> 5 > 1 << this.shift ? (b = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], c = this.shift + 5, b[0] = this.root, b[1] = sf(this.root.R, this.shift, a), this.root = new of(this.root.R, b), this.shift = c) : this.root = Lf(this, this.shift, this.root, a);
    }
    this.s += 1;
    return this;
  }
  throw Error("conj! after persistent!");
};
h.Bb = function() {
  if (this.root.R) {
    this.root.R = null;
    var a = this.s - rf(this), b = Array(a);
    Ed(this.xa, 0, b, 0, a);
    return new K(null, this.s, this.shift, this.root, b, null);
  }
  throw Error("persistent! called twice");
};
h.tb = function(a, b, c) {
  if ("number" === typeof b) {
    return Mf(this, b, c);
  }
  throw Error("TransientVector's key for assoc! must be a number.");
};
function Mf(a, b, c) {
  if (a.root.R) {
    if (0 <= b && b < a.s) {
      if (rf(a) <= b) {
        a.xa[b & 31] = c;
      } else {
        var d = function() {
          return function k(f, g) {
            g = Kf(a.root.R, g);
            if (0 === f) {
              g.j[b & 31] = c;
            } else {
              var l = b >>> f & 31;
              f = k(f - 5, g.j[l]);
              g.j[l] = f;
            }
            return g;
          }(a.shift, a.root);
        }();
        a.root = d;
      }
      return a;
    }
    if (b === a.s) {
      return a.ub(null, c);
    }
    throw Error(["Index ", u.h(b), " out of bounds for TransientVector of length", u.h(a.s)].join(""));
  }
  throw Error("assoc! after persistent!");
}
h.N = function() {
  if (this.root.R) {
    return this.s;
  }
  throw Error("count after persistent!");
};
h.M = function(a, b) {
  if (this.root.R) {
    return (0 <= b && b < this.s ? vf(this, b) : uf(b, this.s))[b & 31];
  }
  throw Error("nth after persistent!");
};
h.aa = function(a, b, c) {
  return 0 <= b && b < this.s ? this.M(null, b) : c;
};
h.T = function(a, b) {
  return this.H(null, b, null);
};
h.H = function(a, b, c) {
  if (this.root.R) {
    return "number" === typeof b ? this.aa(null, b, c) : c;
  }
  throw Error("lookup after persistent!");
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return this.T(null, c);
      case 3:
        return this.H(null, c, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return this.T(null, c);
  };
  a.i = function(b, c, d) {
    return this.H(null, c, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return this.T(null, a);
};
h.g = function(a, b) {
  return this.H(null, a, b);
};
function Nf() {
  this.o = 2097152;
  this.G = 0;
}
Nf.prototype.equiv = function(a) {
  return this.D(null, a);
};
Nf.prototype.D = function() {
  return !1;
};
var Of = new Nf;
function Pf(a, b) {
  return Gd(Ad(b) && !Bd(b) ? H(a) === H(b) ? (null != a ? a.o & 1048576 || p === a.Lc || (a.o ? 0 : Ua(Nb, a)) : Ua(Nb, a)) ? Sd(function(c, d, e) {
    return E.g(w.i(b, d, Of), e) ? !0 : new Sc;
  }, !0, a) : Ke(function(c) {
    return E.g(w.i(b, B(c), Of), B(C(c)));
  }, a) : null : null);
}
function Qf(a, b, c) {
  this.u = 0;
  this.Dc = a;
  this.Ub = 14;
  this.Ac = b;
  this.$b = c;
}
Qf.prototype.ca = function() {
  var a = this.u < this.Ub;
  return a ? a : this.$b.ca();
};
Qf.prototype.next = function() {
  if (this.u < this.Ub) {
    var a = ad(this.Ac, this.u);
    this.u += 1;
    return new Cf(a, rb.g(this.Dc, a));
  }
  return this.$b.next();
};
Qf.prototype.remove = function() {
  return Error("Unsupported operation");
};
function Rf(a) {
  this.J = a;
}
Rf.prototype.next = function() {
  if (null != this.J) {
    var a = B(this.J), b = I(a, 0);
    a = I(a, 1);
    this.J = C(this.J);
    return {value:[b, a], done:!1};
  }
  return {value:null, done:!0};
};
function Sf(a) {
  this.J = a;
}
Sf.prototype.next = function() {
  if (null != this.J) {
    var a = B(this.J);
    this.J = C(this.J);
    return {value:[a, a], done:!1};
  }
  return {value:null, done:!0};
};
function Tf(a, b) {
  if (b instanceof z) {
    a: {
      var c = a.length;
      b = b.ta;
      for (var d = 0;;) {
        if (c <= d) {
          a = -1;
          break a;
        }
        if (a[d] instanceof z && b === a[d].ta) {
          a = d;
          break a;
        }
        d += 2;
      }
    }
  } else {
    if ("string" === typeof b || "number" === typeof b) {
      a: {
        for (c = a.length, d = 0;;) {
          if (c <= d) {
            a = -1;
            break a;
          }
          if (b === a[d]) {
            a = d;
            break a;
          }
          d += 2;
        }
      }
    } else {
      if (b instanceof Cc) {
        a: {
          for (c = a.length, b = b.Ja, d = 0;;) {
            if (c <= d) {
              a = -1;
              break a;
            }
            if (a[d] instanceof Cc && b === a[d].Ja) {
              a = d;
              break a;
            }
            d += 2;
          }
        }
      } else {
        if (null == b) {
          a: {
            for (b = a.length, c = 0;;) {
              if (b <= c) {
                a = -1;
                break a;
              }
              if (null == a[c]) {
                a = c;
                break a;
              }
              c += 2;
            }
          }
        } else {
          a: {
            for (c = a.length, d = 0;;) {
              if (c <= d) {
                a = -1;
                break a;
              }
              if (E.g(b, a[d])) {
                a = d;
                break a;
              }
              d += 2;
            }
          }
        }
      }
    }
  }
  return a;
}
function Cf(a, b) {
  this.key = a;
  this.I = b;
  this.A = null;
  this.o = 166619935;
  this.G = 0;
}
h = Cf.prototype;
h.ob = function(a, b) {
  switch(b) {
    case 0:
      return new Cf(0, this.key);
    case 1:
      return new Cf(1, this.I);
    default:
      return null;
  }
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.T = function(a, b) {
  return this.aa(null, b, null);
};
h.H = function(a, b, c) {
  return this.aa(null, b, c);
};
h.M = function(a, b) {
  if (0 === b) {
    return this.key;
  }
  if (1 === b) {
    return this.I;
  }
  throw Error("Index out of bounds");
};
h.aa = function(a, b, c) {
  return 0 === b ? this.key : 1 === b ? this.I : c;
};
h.jb = function(a, b, c) {
  return (new K(null, 2, 5, L, [this.key, this.I], null)).jb(null, b, c);
};
h.U = function() {
  return null;
};
h.N = function() {
  return 2;
};
h.oc = function() {
  return this.key;
};
h.pc = function() {
  return this.I;
};
h.rb = function() {
  return this.I;
};
h.sb = function() {
  return new K(null, 1, 5, L, [this.key], null);
};
h.Ab = function() {
  return new Fc([this.I, this.key], 0, null);
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return null;
};
h.fa = function(a, b) {
  return Uc(this, b);
};
h.ga = function(a, b, c) {
  return Vc(this, b, c);
};
h.Ba = function(a, b, c) {
  return pd.i(new K(null, 2, 5, L, [this.key, this.I], null), b, c);
};
h.ab = function(a, b) {
  return 0 === b || 1 === b;
};
h.P = function() {
  return new Fc([this.key, this.I], 0, null);
};
h.V = function(a, b) {
  return ud(new K(null, 2, 5, L, [this.key, this.I], null), b);
};
h.Y = function(a, b) {
  return new K(null, 3, 5, L, [this.key, this.I, b], null);
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return this.M(null, c);
      case 3:
        return this.aa(null, c, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return this.M(null, c);
  };
  a.i = function(b, c, d) {
    return this.aa(null, c, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return this.M(null, a);
};
h.g = function(a, b) {
  return this.aa(null, a, b);
};
function Gf(a) {
  return null != a ? a.o & 2048 || p === a.Oc ? !0 : !1 : !1;
}
function Uf(a, b, c) {
  this.j = a;
  this.u = b;
  this.Ia = c;
  this.o = 32374990;
  this.G = 0;
}
h = Uf.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.Ia;
};
h.ba = function() {
  return this.u < this.j.length - 2 ? new Uf(this.j, this.u + 2, null) : null;
};
h.N = function() {
  return (this.j.length - this.u) / 2;
};
h.S = function() {
  return Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  return new Cf(this.j[this.u], this.j[this.u + 1]);
};
h.ja = function() {
  return this.u < this.j.length - 2 ? new Uf(this.j, this.u + 2, null) : Ic;
};
h.P = function() {
  return this;
};
h.V = function(a, b) {
  return b === this.Ia ? this : new Uf(this.j, this.u, b);
};
h.Y = function(a, b) {
  return fd(b, this);
};
Uf.prototype[Ya] = function() {
  return Kc(this);
};
function Vf(a, b) {
  this.j = a;
  this.u = 0;
  this.s = b;
}
Vf.prototype.ca = function() {
  return this.u < this.s;
};
Vf.prototype.next = function() {
  var a = new Cf(this.j[this.u], this.j[this.u + 1]);
  this.u += 2;
  return a;
};
function r(a, b, c, d) {
  this.v = a;
  this.s = b;
  this.j = c;
  this.A = d;
  this.o = 16647951;
  this.G = 139268;
}
h = r.prototype;
h.ob = function(a, b) {
  a = Tf(this.j, b);
  return -1 === a ? null : new Cf(this.j[a], this.j[a + 1]);
};
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.keys = function() {
  return Kc(Wf(this));
};
h.entries = function() {
  return new Rf(A(A(this)));
};
h.values = function() {
  return Kc(Xf(this));
};
h.has = function(a) {
  return Id(this, a);
};
h.get = function(a, b) {
  return this.H(null, a, b);
};
h.forEach = function(a) {
  for (var b = A(this), c = null, d = 0, e = 0;;) {
    if (e < d) {
      var f = c.M(null, e), g = I(f, 0);
      f = I(f, 1);
      a.g ? a.g(f, g) : a.call(null, f, g);
      e += 1;
    } else {
      if (b = A(b)) {
        Dd(b) ? (c = ic(b), b = jc(b), g = c, d = H(c), c = g) : (c = B(b), g = I(c, 0), f = I(c, 1), a.g ? a.g(f, g) : a.call(null, f, g), b = C(b), c = null, d = 0), e = 0;
      } else {
        return null;
      }
    }
  }
};
h.T = function(a, b) {
  return this.H(null, b, null);
};
h.H = function(a, b, c) {
  a = Tf(this.j, b);
  return -1 === a ? c : this.j[a + 1];
};
h.pb = function(a, b, c) {
  a = this.j.length;
  for (var d = 0;;) {
    if (d < a) {
      var e = this.j[d], f = this.j[d + 1];
      c = b.i ? b.i(c, e, f) : b.call(null, c, e, f);
      if (Tc(c)) {
        return Gb(c);
      }
      d += 2;
    } else {
      return c;
    }
  }
};
h.za = function() {
  return new Vf(this.j, 2 * this.s);
};
h.U = function() {
  return this.v;
};
h.N = function() {
  return this.s;
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Pc(this);
};
h.D = function(a, b) {
  if (Ad(b) && !Bd(b)) {
    if (a = this.j.length, this.s === b.N(null)) {
      for (var c = 0;;) {
        if (c < a) {
          var d = b.H(null, this.j[c], Fd);
          if (d !== Fd) {
            if (E.g(this.j[c + 1], d)) {
              c += 2;
            } else {
              return !1;
            }
          } else {
            return !1;
          }
        } else {
          return !0;
        }
      }
    } else {
      return !1;
    }
  } else {
    return !1;
  }
};
h.nb = function() {
  return new Yf(this.j.length, Za(this.j));
};
h.$ = function() {
  return Jb(Ge, this.v);
};
h.fa = function(a, b) {
  return Pd(this, b);
};
h.ga = function(a, b, c) {
  return Qd(this, b, c);
};
h.Ba = function(a, b, c) {
  a = Tf(this.j, b);
  if (-1 === a) {
    if (this.s < Zf) {
      a = this.j;
      for (var d = a.length, e = Array(d + 2), f = 0;;) {
        if (f < d) {
          e[f] = a[f], f += 1;
        } else {
          break;
        }
      }
      e[d] = b;
      e[d + 1] = c;
      return new r(this.v, this.s + 1, e, null);
    }
    return Jb(vb(hf($f, this), b, c), this.v);
  }
  if (c === this.j[a + 1]) {
    return this;
  }
  b = Za(this.j);
  b[a + 1] = c;
  return new r(this.v, this.s, b, null);
};
h.ab = function(a, b) {
  return -1 !== Tf(this.j, b);
};
h.P = function() {
  var a = this.j;
  return 0 <= a.length - 2 ? new Uf(a, 0, null) : null;
};
h.V = function(a, b) {
  return b === this.v ? this : new r(b, this.s, this.j, this.A);
};
h.Y = function(a, b) {
  if (Cd(b)) {
    return this.Ba(null, kb.g(b, 0), kb.g(b, 1));
  }
  a = this;
  for (b = A(b);;) {
    if (null == b) {
      return a;
    }
    var c = B(b);
    if (Cd(c)) {
      a = vb(a, kb.g(c, 0), kb.g(c, 1)), b = C(b);
    } else {
      throw Error("conj on a map takes map entries or seqables of map entries");
    }
  }
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return this.T(null, c);
      case 3:
        return this.H(null, c, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return this.T(null, c);
  };
  a.i = function(b, c, d) {
    return this.H(null, c, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return this.T(null, a);
};
h.g = function(a, b) {
  return this.H(null, a, b);
};
var Ge = new r(null, 0, [], Qc), Zf = 8;
function qd(a) {
  for (var b = [], c = 0;;) {
    if (c < a.length) {
      var d = a[c], e = a[c + 1], f = Tf(b, d);
      -1 === f ? (f = b, f.push(d), f.push(e)) : b[f + 1] = e;
      c += 2;
    } else {
      break;
    }
  }
  return new r(null, b.length / 2, b, null);
}
r.prototype[Ya] = function() {
  return Kc(this);
};
function Yf(a, b) {
  this.vb = {};
  this.wb = a;
  this.j = b;
  this.o = 259;
  this.G = 56;
}
h = Yf.prototype;
h.N = function() {
  if (this.vb) {
    return Yd(this.wb, 2);
  }
  throw Error("count after persistent!");
};
h.T = function(a, b) {
  return this.H(null, b, null);
};
h.H = function(a, b, c) {
  if (this.vb) {
    return a = Tf(this.j, b), -1 === a ? c : this.j[a + 1];
  }
  throw Error("lookup after persistent!");
};
h.ub = function(a, b) {
  if (this.vb) {
    if (Gf(b)) {
      return this.tb(null, zb(b), Ab(b));
    }
    if (Cd(b)) {
      return this.tb(null, b.h ? b.h(0) : b.call(null, 0), b.h ? b.h(1) : b.call(null, 1));
    }
    a = A(b);
    for (b = this;;) {
      var c = B(a);
      if (t(c)) {
        a = C(a), b = dc(b, zb(c), Ab(c));
      } else {
        return b;
      }
    }
  } else {
    throw Error("conj! after persistent!");
  }
};
h.Bb = function() {
  if (this.vb) {
    return this.vb = !1, new r(null, Yd(this.wb, 2), this.j, null);
  }
  throw Error("persistent! called twice");
};
h.tb = function(a, b, c) {
  if (this.vb) {
    a = Tf(this.j, b);
    if (-1 === a) {
      if (this.wb + 2 <= 2 * Zf) {
        return this.wb += 2, this.j.push(b), this.j.push(c), this;
      }
      a: {
        a = this.wb;
        for (var d = this.j, e = ac($f), f = 0;;) {
          if (f < a) {
            e = dc(e, d[f], d[f + 1]), f += 2;
          } else {
            break a;
          }
        }
      }
      return dc(e, b, c);
    }
    c !== this.j[a + 1] && (this.j[a + 1] = c);
    return this;
  }
  throw Error("assoc! after persistent!");
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return this.H(null, c, null);
      case 3:
        return this.H(null, c, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return this.H(null, c, null);
  };
  a.i = function(b, c, d) {
    return this.H(null, c, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return this.H(null, a, null);
};
h.g = function(a, b) {
  return this.H(null, a, b);
};
function ag() {
  this.I = !1;
}
function bg(a, b) {
  return a === b ? !0 : ge(a, b) ? !0 : E.g(a, b);
}
function cg(a, b, c) {
  a = Za(a);
  a[b] = c;
  return a;
}
function dg(a, b, c, d) {
  a = a.kb(b);
  a.j[c] = d;
  return a;
}
function eg(a, b, c) {
  for (var d = a.length, e = 0, f = c;;) {
    if (e < d) {
      c = a[e];
      if (null != c) {
        var g = a[e + 1];
        c = b.i ? b.i(f, c, g) : b.call(null, f, c, g);
      } else {
        c = a[e + 1], c = null != c ? c.Hb(b, f) : f;
      }
      if (Tc(c)) {
        return c;
      }
      e += 2;
      f = c;
    } else {
      return f;
    }
  }
}
function fg(a) {
  this.j = a;
  this.u = 0;
  this.Ga = this.Ib = null;
}
fg.prototype.advance = function() {
  for (var a = this.j.length;;) {
    if (this.u < a) {
      var b = this.j[this.u], c = this.j[this.u + 1];
      null != b ? b = this.Ib = new Cf(b, c) : null != c ? (b = oc(c), b = b.ca() ? this.Ga = b : !1) : b = !1;
      this.u += 2;
      if (b) {
        return !0;
      }
    } else {
      return !1;
    }
  }
};
fg.prototype.ca = function() {
  var a = null != this.Ib;
  return a ? a : (a = null != this.Ga) ? a : this.advance();
};
fg.prototype.next = function() {
  if (null != this.Ib) {
    var a = this.Ib;
    this.Ib = null;
    return a;
  }
  if (null != this.Ga) {
    return a = this.Ga.next(), this.Ga.ca() || (this.Ga = null), a;
  }
  if (this.advance()) {
    return this.next();
  }
  throw Error("No such element");
};
fg.prototype.remove = function() {
  return Error("Unsupported operation");
};
function gg(a, b, c) {
  this.R = a;
  this.da = b;
  this.j = c;
  this.G = 131072;
  this.o = 0;
}
h = gg.prototype;
h.kb = function(a) {
  if (a === this.R) {
    return this;
  }
  var b = $d(this.da), c = Array(0 > b ? 4 : 2 * (b + 1));
  Ed(this.j, 0, c, 0, 2 * b);
  return new gg(a, this.da, c);
};
h.Fb = function() {
  return hg(this.j, 0, null);
};
h.Hb = function(a, b) {
  return eg(this.j, a, b);
};
h.fb = function(a, b, c, d) {
  var e = 1 << (b >>> a & 31);
  if (0 === (this.da & e)) {
    return d;
  }
  var f = $d(this.da & e - 1);
  e = this.j[2 * f];
  f = this.j[2 * f + 1];
  return null == e ? f.fb(a + 5, b, c, d) : bg(c, e) ? f : d;
};
h.Ea = function(a, b, c, d, e, f) {
  var g = 1 << (c >>> b & 31), k = $d(this.da & g - 1);
  if (0 === (this.da & g)) {
    var l = $d(this.da);
    if (2 * l < this.j.length) {
      a = this.kb(a);
      b = a.j;
      f.I = !0;
      a: {
        for (c = 2 * (l - k), f = 2 * k + (c - 1), l = 2 * (k + 1) + (c - 1);;) {
          if (0 === c) {
            break a;
          }
          b[l] = b[f];
          --l;
          --c;
          --f;
        }
      }
      b[2 * k] = d;
      b[2 * k + 1] = e;
      a.da |= g;
      return a;
    }
    if (16 <= l) {
      k = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
      k[c >>> b & 31] = ig.Ea(a, b + 5, c, d, e, f);
      for (e = d = 0;;) {
        if (32 > d) {
          0 === (this.da >>> d & 1) ? d += 1 : (k[d] = null != this.j[e] ? ig.Ea(a, b + 5, zc(this.j[e]), this.j[e], this.j[e + 1], f) : this.j[e + 1], e += 2, d += 1);
        } else {
          break;
        }
      }
      return new jg(a, l + 1, k);
    }
    b = Array(2 * (l + 4));
    Ed(this.j, 0, b, 0, 2 * k);
    b[2 * k] = d;
    b[2 * k + 1] = e;
    Ed(this.j, 2 * k, b, 2 * (k + 1), 2 * (l - k));
    f.I = !0;
    a = this.kb(a);
    a.j = b;
    a.da |= g;
    return a;
  }
  l = this.j[2 * k];
  g = this.j[2 * k + 1];
  if (null == l) {
    return l = g.Ea(a, b + 5, c, d, e, f), l === g ? this : dg(this, a, 2 * k + 1, l);
  }
  if (bg(d, l)) {
    return e === g ? this : dg(this, a, 2 * k + 1, e);
  }
  f.I = !0;
  f = b + 5;
  b = zc(l);
  if (b === c) {
    e = new kg(null, b, 2, [l, g, d, e]);
  } else {
    var m = new ag;
    e = ig.Ea(a, f, b, l, g, m).Ea(a, f, c, d, e, m);
  }
  d = 2 * k;
  k = 2 * k + 1;
  a = this.kb(a);
  a.j[d] = null;
  a.j[k] = e;
  return a;
};
h.Da = function(a, b, c, d, e) {
  var f = 1 << (b >>> a & 31), g = $d(this.da & f - 1);
  if (0 === (this.da & f)) {
    var k = $d(this.da);
    if (16 <= k) {
      g = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
      g[b >>> a & 31] = ig.Da(a + 5, b, c, d, e);
      for (d = c = 0;;) {
        if (32 > c) {
          0 === (this.da >>> c & 1) ? c += 1 : (g[c] = null != this.j[d] ? ig.Da(a + 5, zc(this.j[d]), this.j[d], this.j[d + 1], e) : this.j[d + 1], d += 2, c += 1);
        } else {
          break;
        }
      }
      return new jg(null, k + 1, g);
    }
    a = Array(2 * (k + 1));
    Ed(this.j, 0, a, 0, 2 * g);
    a[2 * g] = c;
    a[2 * g + 1] = d;
    Ed(this.j, 2 * g, a, 2 * (g + 1), 2 * (k - g));
    e.I = !0;
    return new gg(null, this.da | f, a);
  }
  var l = this.j[2 * g];
  f = this.j[2 * g + 1];
  if (null == l) {
    return k = f.Da(a + 5, b, c, d, e), k === f ? this : new gg(null, this.da, cg(this.j, 2 * g + 1, k));
  }
  if (bg(c, l)) {
    return d === f ? this : new gg(null, this.da, cg(this.j, 2 * g + 1, d));
  }
  e.I = !0;
  e = this.da;
  k = this.j;
  a += 5;
  var m = zc(l);
  if (m === b) {
    c = new kg(null, m, 2, [l, f, c, d]);
  } else {
    var n = new ag;
    c = ig.Da(a, m, l, f, n).Da(a, b, c, d, n);
  }
  a = 2 * g;
  g = 2 * g + 1;
  d = Za(k);
  d[a] = null;
  d[g] = c;
  return new gg(null, e, d);
};
h.Eb = function(a, b, c, d) {
  var e = 1 << (b >>> a & 31);
  if (0 === (this.da & e)) {
    return d;
  }
  var f = $d(this.da & e - 1);
  e = this.j[2 * f];
  f = this.j[2 * f + 1];
  return null == e ? f.Eb(a + 5, b, c, d) : bg(c, e) ? new Cf(e, f) : d;
};
h.za = function() {
  return new fg(this.j);
};
var ig = new gg(null, 0, []);
function lg(a) {
  this.j = a;
  this.u = 0;
  this.Ga = null;
}
lg.prototype.ca = function() {
  for (var a = this.j.length;;) {
    if (null != this.Ga && this.Ga.ca()) {
      return !0;
    }
    if (this.u < a) {
      var b = this.j[this.u];
      this.u += 1;
      null != b && (this.Ga = oc(b));
    } else {
      return !1;
    }
  }
};
lg.prototype.next = function() {
  if (this.ca()) {
    return this.Ga.next();
  }
  throw Error("No such element");
};
lg.prototype.remove = function() {
  return Error("Unsupported operation");
};
function jg(a, b, c) {
  this.R = a;
  this.s = b;
  this.j = c;
  this.G = 131072;
  this.o = 0;
}
h = jg.prototype;
h.kb = function(a) {
  return a === this.R ? this : new jg(a, this.s, Za(this.j));
};
h.Fb = function() {
  return mg(this.j, 0, null);
};
h.Hb = function(a, b) {
  for (var c = this.j.length, d = 0;;) {
    if (d < c) {
      var e = this.j[d];
      if (null != e) {
        b = e.Hb(a, b);
        if (Tc(b)) {
          return b;
        }
        d += 1;
      } else {
        d += 1;
      }
    } else {
      return b;
    }
  }
};
h.fb = function(a, b, c, d) {
  var e = this.j[b >>> a & 31];
  return null != e ? e.fb(a + 5, b, c, d) : d;
};
h.Ea = function(a, b, c, d, e, f) {
  var g = c >>> b & 31, k = this.j[g];
  if (null == k) {
    return a = dg(this, a, g, ig.Ea(a, b + 5, c, d, e, f)), a.s += 1, a;
  }
  b = k.Ea(a, b + 5, c, d, e, f);
  return b === k ? this : dg(this, a, g, b);
};
h.Da = function(a, b, c, d, e) {
  var f = b >>> a & 31, g = this.j[f];
  if (null == g) {
    return new jg(null, this.s + 1, cg(this.j, f, ig.Da(a + 5, b, c, d, e)));
  }
  a = g.Da(a + 5, b, c, d, e);
  return a === g ? this : new jg(null, this.s, cg(this.j, f, a));
};
h.Eb = function(a, b, c, d) {
  var e = this.j[b >>> a & 31];
  return null != e ? e.Eb(a + 5, b, c, d) : d;
};
h.za = function() {
  return new lg(this.j);
};
function ng(a, b, c) {
  b *= 2;
  for (var d = 0;;) {
    if (d < b) {
      if (bg(c, a[d])) {
        return d;
      }
      d += 2;
    } else {
      return -1;
    }
  }
}
function kg(a, b, c, d) {
  this.R = a;
  this.cb = b;
  this.s = c;
  this.j = d;
  this.G = 131072;
  this.o = 0;
}
h = kg.prototype;
h.kb = function(a) {
  if (a === this.R) {
    return this;
  }
  var b = Array(2 * (this.s + 1));
  Ed(this.j, 0, b, 0, 2 * this.s);
  return new kg(a, this.cb, this.s, b);
};
h.Fb = function() {
  return hg(this.j, 0, null);
};
h.Hb = function(a, b) {
  return eg(this.j, a, b);
};
h.fb = function(a, b, c, d) {
  a = ng(this.j, this.s, c);
  return 0 > a ? d : bg(c, this.j[a]) ? this.j[a + 1] : d;
};
h.Ea = function(a, b, c, d, e, f) {
  if (c === this.cb) {
    b = ng(this.j, this.s, d);
    if (-1 === b) {
      if (this.j.length > 2 * this.s) {
        return b = 2 * this.s, c = 2 * this.s + 1, a = this.kb(a), a.j[b] = d, a.j[c] = e, f.I = !0, a.s += 1, a;
      }
      c = this.j.length;
      b = Array(c + 2);
      Ed(this.j, 0, b, 0, c);
      b[c] = d;
      b[c + 1] = e;
      f.I = !0;
      d = this.s + 1;
      a === this.R ? (this.j = b, this.s = d, a = this) : a = new kg(this.R, this.cb, d, b);
      return a;
    }
    return this.j[b + 1] === e ? this : dg(this, a, b + 1, e);
  }
  return (new gg(a, 1 << (this.cb >>> b & 31), [null, this, null, null])).Ea(a, b, c, d, e, f);
};
h.Da = function(a, b, c, d, e) {
  return b === this.cb ? (a = ng(this.j, this.s, c), -1 === a ? (a = 2 * this.s, b = Array(a + 2), Ed(this.j, 0, b, 0, a), b[a] = c, b[a + 1] = d, e.I = !0, new kg(null, this.cb, this.s + 1, b)) : E.g(this.j[a + 1], d) ? this : new kg(null, this.cb, this.s, cg(this.j, a + 1, d))) : (new gg(null, 1 << (this.cb >>> a & 31), [null, this])).Da(a, b, c, d, e);
};
h.Eb = function(a, b, c, d) {
  a = ng(this.j, this.s, c);
  return 0 > a ? d : bg(c, this.j[a]) ? new Cf(this.j[a], this.j[a + 1]) : d;
};
h.za = function() {
  return new fg(this.j);
};
function og(a, b, c, d, e) {
  this.v = a;
  this.Ha = b;
  this.u = c;
  this.J = d;
  this.A = e;
  this.o = 32374988;
  this.G = 0;
}
h = og.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  return null == this.J ? hg(this.Ha, this.u + 2, null) : hg(this.Ha, this.u, C(this.J));
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  return null == this.J ? new Cf(this.Ha[this.u], this.Ha[this.u + 1]) : B(this.J);
};
h.ja = function() {
  var a = null == this.J ? hg(this.Ha, this.u + 2, null) : hg(this.Ha, this.u, C(this.J));
  return null != a ? a : Ic;
};
h.P = function() {
  return this;
};
h.V = function(a, b) {
  return b === this.v ? this : new og(b, this.Ha, this.u, this.J, this.A);
};
h.Y = function(a, b) {
  return fd(b, this);
};
og.prototype[Ya] = function() {
  return Kc(this);
};
function hg(a, b, c) {
  if (null == c) {
    for (c = a.length;;) {
      if (b < c) {
        if (null != a[b]) {
          return new og(null, a, b, null, null);
        }
        var d = a[b + 1];
        if (t(d) && (d = d.Fb(), t(d))) {
          return new og(null, a, b + 2, d, null);
        }
        b += 2;
      } else {
        return null;
      }
    }
  } else {
    return new og(null, a, b, c, null);
  }
}
function pg(a, b, c, d, e) {
  this.v = a;
  this.Ha = b;
  this.u = c;
  this.J = d;
  this.A = e;
  this.o = 32374988;
  this.G = 0;
}
h = pg.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.v;
};
h.ba = function() {
  return mg(this.Ha, this.u, C(this.J));
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  return B(this.J);
};
h.ja = function() {
  var a = mg(this.Ha, this.u, C(this.J));
  return null != a ? a : Ic;
};
h.P = function() {
  return this;
};
h.V = function(a, b) {
  return b === this.v ? this : new pg(b, this.Ha, this.u, this.J, this.A);
};
h.Y = function(a, b) {
  return fd(b, this);
};
pg.prototype[Ya] = function() {
  return Kc(this);
};
function mg(a, b, c) {
  if (null == c) {
    for (c = a.length;;) {
      if (b < c) {
        var d = a[b];
        if (t(d) && (d = d.Fb(), t(d))) {
          return new pg(null, a, b + 1, d, null);
        }
        b += 1;
      } else {
        return null;
      }
    }
  } else {
    return new pg(null, a, b, c, null);
  }
}
function qg(a, b) {
  this.ua = a;
  this.cc = b;
  this.Tb = !1;
}
qg.prototype.ca = function() {
  return !this.Tb || this.cc.ca();
};
qg.prototype.next = function() {
  if (this.Tb) {
    return this.cc.next();
  }
  this.Tb = !0;
  return new Cf(null, this.ua);
};
qg.prototype.remove = function() {
  return Error("Unsupported operation");
};
function rg(a, b, c, d, e, f) {
  this.v = a;
  this.s = b;
  this.root = c;
  this.va = d;
  this.ua = e;
  this.A = f;
  this.o = 16123663;
  this.G = 139268;
}
h = rg.prototype;
h.ob = function(a, b) {
  return null == b ? this.va ? new Cf(null, this.ua) : null : null == this.root ? null : this.root.Eb(0, zc(b), b, null);
};
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.keys = function() {
  return Kc(Wf(this));
};
h.entries = function() {
  return new Rf(A(A(this)));
};
h.values = function() {
  return Kc(Xf(this));
};
h.has = function(a) {
  return Id(this, a);
};
h.get = function(a, b) {
  return this.H(null, a, b);
};
h.forEach = function(a) {
  for (var b = A(this), c = null, d = 0, e = 0;;) {
    if (e < d) {
      var f = c.M(null, e), g = I(f, 0);
      f = I(f, 1);
      a.g ? a.g(f, g) : a.call(null, f, g);
      e += 1;
    } else {
      if (b = A(b)) {
        Dd(b) ? (c = ic(b), b = jc(b), g = c, d = H(c), c = g) : (c = B(b), g = I(c, 0), f = I(c, 1), a.g ? a.g(f, g) : a.call(null, f, g), b = C(b), c = null, d = 0), e = 0;
      } else {
        return null;
      }
    }
  }
};
h.T = function(a, b) {
  return this.H(null, b, null);
};
h.H = function(a, b, c) {
  return null == b ? this.va ? this.ua : c : null == this.root ? c : this.root.fb(0, zc(b), b, c);
};
h.pb = function(a, b, c) {
  a = this.va ? b.i ? b.i(c, null, this.ua) : b.call(null, c, null, this.ua) : c;
  Tc(a) ? b = Gb(a) : null != this.root ? (b = this.root.Hb(b, a), b = Tc(b) ? Gb(b) : b) : b = a;
  return b;
};
h.za = function() {
  var a = this.root ? oc(this.root) : Fe();
  return this.va ? new qg(this.ua, a) : a;
};
h.U = function() {
  return this.v;
};
h.N = function() {
  return this.s;
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Pc(this);
};
h.D = function(a, b) {
  return Pf(this, b);
};
h.nb = function() {
  return new sg(this.root, this.s, this.va, this.ua);
};
h.$ = function() {
  return Jb($f, this.v);
};
h.Ba = function(a, b, c) {
  if (null == b) {
    return this.va && c === this.ua ? this : new rg(this.v, this.va ? this.s : this.s + 1, this.root, !0, c, null);
  }
  a = new ag;
  b = (null == this.root ? ig : this.root).Da(0, zc(b), b, c, a);
  return b === this.root ? this : new rg(this.v, a.I ? this.s + 1 : this.s, b, this.va, this.ua, null);
};
h.ab = function(a, b) {
  return null == b ? this.va : null == this.root ? !1 : this.root.fb(0, zc(b), b, Fd) !== Fd;
};
h.P = function() {
  if (0 < this.s) {
    var a = null != this.root ? this.root.Fb() : null;
    return this.va ? fd(new Cf(null, this.ua), a) : a;
  }
  return null;
};
h.V = function(a, b) {
  return b === this.v ? this : new rg(b, this.s, this.root, this.va, this.ua, this.A);
};
h.Y = function(a, b) {
  if (Cd(b)) {
    return this.Ba(null, kb.g(b, 0), kb.g(b, 1));
  }
  a = this;
  for (b = A(b);;) {
    if (null == b) {
      return a;
    }
    var c = B(b);
    if (Cd(c)) {
      a = vb(a, kb.g(c, 0), kb.g(c, 1)), b = C(b);
    } else {
      throw Error("conj on a map takes map entries or seqables of map entries");
    }
  }
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return this.T(null, c);
      case 3:
        return this.H(null, c, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return this.T(null, c);
  };
  a.i = function(b, c, d) {
    return this.H(null, c, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return this.T(null, a);
};
h.g = function(a, b) {
  return this.H(null, a, b);
};
var $f = new rg(null, 0, null, !1, null, Qc);
function tg(a, b) {
  for (var c = a.length, d = 0, e = ac($f);;) {
    if (d < c) {
      var f = d + 1;
      e = dc(e, a[d], b[d]);
      d = f;
    } else {
      return cc(e);
    }
  }
}
rg.prototype[Ya] = function() {
  return Kc(this);
};
function sg(a, b, c, d) {
  this.R = {};
  this.root = a;
  this.count = b;
  this.va = c;
  this.ua = d;
  this.o = 259;
  this.G = 56;
}
function ug(a, b, c) {
  if (a.R) {
    if (null == b) {
      a.ua !== c && (a.ua = c), a.va || (a.count += 1, a.va = !0);
    } else {
      var d = new ag;
      b = (null == a.root ? ig : a.root).Ea(a.R, 0, zc(b), b, c, d);
      b !== a.root && (a.root = b);
      d.I && (a.count += 1);
    }
    return a;
  }
  throw Error("assoc! after persistent!");
}
h = sg.prototype;
h.N = function() {
  if (this.R) {
    return this.count;
  }
  throw Error("count after persistent!");
};
h.T = function(a, b) {
  return null == b ? this.va ? this.ua : null : null == this.root ? null : this.root.fb(0, zc(b), b);
};
h.H = function(a, b, c) {
  return null == b ? this.va ? this.ua : c : null == this.root ? c : this.root.fb(0, zc(b), b, c);
};
h.ub = function(a, b) {
  a: {
    if (this.R) {
      if (Gf(b)) {
        a = ug(this, zb(b), Ab(b));
      } else {
        if (Cd(b)) {
          a = ug(this, b.h ? b.h(0) : b.call(null, 0), b.h ? b.h(1) : b.call(null, 1));
        } else {
          for (a = A(b), b = this;;) {
            var c = B(a);
            if (t(c)) {
              a = C(a), b = ug(b, zb(c), Ab(c));
            } else {
              a = b;
              break a;
            }
          }
        }
      }
    } else {
      throw Error("conj! after persistent");
    }
  }
  return a;
};
h.Bb = function() {
  if (this.R) {
    this.R = null;
    var a = new rg(null, this.count, this.root, this.va, this.ua, null);
  } else {
    throw Error("persistent! called twice");
  }
  return a;
};
h.tb = function(a, b, c) {
  return ug(this, b, c);
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return this.T(null, c);
      case 3:
        return this.H(null, c, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return this.T(null, c);
  };
  a.i = function(b, c, d) {
    return this.H(null, c, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return this.T(null, a);
};
h.g = function(a, b) {
  return this.H(null, a, b);
};
var Ee = function Ee(a) {
  for (var c = [], d = arguments.length, e = 0;;) {
    if (e < d) {
      c.push(arguments[e]), e += 1;
    } else {
      break;
    }
  }
  return Ee.m(0 < c.length ? new Fc(c.slice(0), 0, null) : null);
};
Ee.m = function(a) {
  for (var b = A(a), c = ac($f);;) {
    if (b) {
      a = C(C(b));
      var d = B(b);
      b = B(C(b));
      c = dc(c, d, b);
      b = a;
    } else {
      return cc(c);
    }
  }
};
Ee.C = 0;
Ee.B = function(a) {
  return this.m(A(a));
};
var vg = function vg(a) {
  for (var c = [], d = arguments.length, e = 0;;) {
    if (e < d) {
      c.push(arguments[e]), e += 1;
    } else {
      break;
    }
  }
  return vg.m(0 < c.length ? new Fc(c.slice(0), 0, null) : null);
};
vg.m = function(a) {
  a = a instanceof Fc && 0 === a.u ? a.j : $a(a);
  return qd(a);
};
vg.C = 0;
vg.B = function(a) {
  return this.m(A(a));
};
function wg(a, b) {
  this.K = a;
  this.Ia = b;
  this.o = 32374988;
  this.G = 0;
}
h = wg.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.Ia;
};
h.ba = function() {
  var a = (null != this.K ? this.K.o & 128 || p === this.K.zb || (this.K.o ? 0 : Ua(pb, this.K)) : Ua(pb, this.K)) ? this.K.ba() : C(this.K);
  return null == a ? null : new wg(a, null);
};
h.S = function() {
  return Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  return this.K.ha(null).key;
};
h.ja = function() {
  var a = (null != this.K ? this.K.o & 128 || p === this.K.zb || (this.K.o ? 0 : Ua(pb, this.K)) : Ua(pb, this.K)) ? this.K.ba() : C(this.K);
  return null != a ? new wg(a, null) : Ic;
};
h.P = function() {
  return this;
};
h.V = function(a, b) {
  return b === this.Ia ? this : new wg(this.K, b);
};
h.Y = function(a, b) {
  return fd(b, this);
};
wg.prototype[Ya] = function() {
  return Kc(this);
};
function Wf(a) {
  return (a = A(a)) ? new wg(a, null) : null;
}
function xg(a, b) {
  this.K = a;
  this.Ia = b;
  this.o = 32374988;
  this.G = 0;
}
h = xg.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.U = function() {
  return this.Ia;
};
h.ba = function() {
  var a = (null != this.K ? this.K.o & 128 || p === this.K.zb || (this.K.o ? 0 : Ua(pb, this.K)) : Ua(pb, this.K)) ? this.K.ba() : C(this.K);
  return null == a ? null : new xg(a, null);
};
h.S = function() {
  return Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  return id(b, c, this);
};
h.ha = function() {
  return this.K.ha(null).I;
};
h.ja = function() {
  var a = (null != this.K ? this.K.o & 128 || p === this.K.zb || (this.K.o ? 0 : Ua(pb, this.K)) : Ua(pb, this.K)) ? this.K.ba() : C(this.K);
  return null != a ? new xg(a, null) : Ic;
};
h.P = function() {
  return this;
};
h.V = function(a, b) {
  return b === this.Ia ? this : new xg(this.K, b);
};
h.Y = function(a, b) {
  return fd(b, this);
};
xg.prototype[Ya] = function() {
  return Kc(this);
};
function Xf(a) {
  return (a = A(a)) ? new xg(a, null) : null;
}
function yg(a) {
  return t(Le(a)) ? Rd(function(b, c) {
    return jd.g(t(b) ? b : Ge, c);
  }, a) : null;
}
function zg(a) {
  this.Gb = a;
}
zg.prototype.ca = function() {
  return this.Gb.ca();
};
zg.prototype.next = function() {
  if (this.Gb.ca()) {
    return this.Gb.next().key;
  }
  throw Error("No such element");
};
zg.prototype.remove = function() {
  return Error("Unsupported operation");
};
function Ag(a, b, c) {
  this.v = a;
  this.eb = b;
  this.A = c;
  this.o = 15077647;
  this.G = 139268;
}
h = Ag.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.keys = function() {
  return Kc(A(this));
};
h.entries = function() {
  return new Sf(A(A(this)));
};
h.values = function() {
  return Kc(A(this));
};
h.has = function(a) {
  return Id(this, a);
};
h.forEach = function(a) {
  for (var b = A(this), c = null, d = 0, e = 0;;) {
    if (e < d) {
      var f = c.M(null, e), g = I(f, 0);
      f = I(f, 1);
      a.g ? a.g(f, g) : a.call(null, f, g);
      e += 1;
    } else {
      if (b = A(b)) {
        Dd(b) ? (c = ic(b), b = jc(b), g = c, d = H(c), c = g) : (c = B(b), g = I(c, 0), f = I(c, 1), a.g ? a.g(f, g) : a.call(null, f, g), b = C(b), c = null, d = 0), e = 0;
      } else {
        return null;
      }
    }
  }
};
h.T = function(a, b) {
  return this.H(null, b, null);
};
h.H = function(a, b, c) {
  a = xb(this.eb, b);
  return t(a) ? zb(a) : c;
};
h.za = function() {
  return new zg(oc(this.eb));
};
h.U = function() {
  return this.v;
};
h.N = function() {
  return eb(this.eb);
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Pc(this);
};
h.D = function(a, b) {
  if (a = yd(b)) {
    if (a = H(this) === H(b)) {
      try {
        return Sd(function(c, d) {
          return (c = Id(b, d)) ? c : new Sc;
        }, !0, this.eb);
      } catch (c) {
        if (c instanceof Error) {
          return !1;
        }
        throw c;
      }
    } else {
      return a;
    }
  } else {
    return a;
  }
};
h.nb = function() {
  return new Bg(ac(this.eb));
};
h.$ = function() {
  return Jb(Dg, this.v);
};
h.P = function() {
  return Wf(this.eb);
};
h.V = function(a, b) {
  return b === this.v ? this : new Ag(b, this.eb, this.A);
};
h.Y = function(a, b) {
  return new Ag(this.v, pd.i(this.eb, b, null), null);
};
h.call = function() {
  var a = null;
  a = function(b, c, d) {
    switch(arguments.length) {
      case 2:
        return this.T(null, c);
      case 3:
        return this.H(null, c, d);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  a.g = function(b, c) {
    return this.T(null, c);
  };
  a.i = function(b, c, d) {
    return this.H(null, c, d);
  };
  return a;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return this.T(null, a);
};
h.g = function(a, b) {
  return this.H(null, a, b);
};
var Dg = new Ag(null, Ge, Qc);
function Eg(a) {
  for (var b = a.length, c = ac(Dg), d = 0;;) {
    if (d < b) {
      bc(c, a[d]), d += 1;
    } else {
      break;
    }
  }
  return cc(c);
}
Ag.prototype[Ya] = function() {
  return Kc(this);
};
function Bg(a) {
  this.$a = a;
  this.G = 136;
  this.o = 259;
}
h = Bg.prototype;
h.ub = function(a, b) {
  this.$a = dc(this.$a, b, null);
  return this;
};
h.Bb = function() {
  return new Ag(null, cc(this.$a), null);
};
h.N = function() {
  return H(this.$a);
};
h.T = function(a, b) {
  return this.H(null, b, null);
};
h.H = function(a, b, c) {
  return rb.i(this.$a, b, Fd) === Fd ? c : b;
};
h.call = function() {
  function a(d, e, f) {
    return rb.i(this.$a, e, Fd) === Fd ? f : e;
  }
  function b(d, e) {
    return rb.i(this.$a, e, Fd) === Fd ? null : e;
  }
  var c = null;
  c = function(d, e, f) {
    switch(arguments.length) {
      case 2:
        return b.call(this, d, e);
      case 3:
        return a.call(this, d, e, f);
    }
    throw Error("Invalid arity: " + (arguments.length - 1));
  };
  c.g = b;
  c.i = a;
  return c;
}();
h.apply = function(a, b) {
  return this.call.apply(this, [this].concat(Za(b)));
};
h.h = function(a) {
  return rb.i(this.$a, a, Fd) === Fd ? null : a;
};
h.g = function(a, b) {
  return rb.i(this.$a, a, Fd) === Fd ? b : a;
};
function Fg(a) {
  if (yd(a)) {
    return ud(a, null);
  }
  a = A(a);
  if (null == a) {
    return Dg;
  }
  if (a instanceof Fc && 0 === a.u) {
    return Eg(a.j);
  }
  for (var b = ac(Dg);;) {
    if (null != a) {
      var c = C(a);
      b = bc(b, nb(a));
      a = c;
    } else {
      return cc(b);
    }
  }
}
function je(a) {
  if (null != a && (a.G & 4096 || p === a.rc)) {
    return a.name;
  }
  if ("string" === typeof a) {
    return a;
  }
  throw Error(["Doesn't support name: ", u.h(a)].join(""));
}
function Gg(a, b, c) {
  this.start = a;
  this.step = b;
  this.count = c;
  this.o = 82;
  this.G = 0;
}
h = Gg.prototype;
h.N = function() {
  return this.count;
};
h.ha = function() {
  return this.start;
};
h.M = function(a, b) {
  return this.start + b * this.step;
};
h.aa = function(a, b, c) {
  return 0 <= b && b < this.count ? this.start + b * this.step : c;
};
h.Qb = function() {
  if (1 >= this.count) {
    throw Error("-drop-first of empty chunk");
  }
  return new Gg(this.start + this.step, this.step, this.count - 1);
};
function Hg(a, b, c) {
  this.u = a;
  this.end = b;
  this.step = c;
}
Hg.prototype.ca = function() {
  return 0 < this.step ? this.u < this.end : this.u > this.end;
};
Hg.prototype.next = function() {
  var a = this.u;
  this.u += this.step;
  return a;
};
function Ig(a, b, c, d, e, f, g) {
  this.v = a;
  this.start = b;
  this.end = c;
  this.step = d;
  this.X = e;
  this.Ka = f;
  this.A = g;
  this.o = 32375006;
  this.G = 140800;
}
h = Ig.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.Db = function() {
  if (null == this.X) {
    var a = this.N(null);
    32 < a ? (this.Ka = new Ig(null, this.start + 32 * this.step, this.end, this.step, null, null, null), this.X = new Gg(this.start, this.step, 32)) : this.X = new Gg(this.start, this.step, a);
  }
};
h.M = function(a, b) {
  if (0 <= b && b < this.N(null)) {
    return this.start + b * this.step;
  }
  if (0 <= b && this.start > this.end && 0 === this.step) {
    return this.start;
  }
  throw Error("Index out of bounds");
};
h.aa = function(a, b, c) {
  return 0 <= b && b < this.N(null) ? this.start + b * this.step : 0 <= b && this.start > this.end && 0 === this.step ? this.start : c;
};
h.za = function() {
  return new Hg(this.start, this.end, this.step);
};
h.U = function() {
  return this.v;
};
h.ba = function() {
  return 0 < this.step ? this.start + this.step < this.end ? new Ig(null, this.start + this.step, this.end, this.step, null, null, null) : null : this.start + this.step > this.end ? new Ig(null, this.start + this.step, this.end, this.step, null, null, null) : null;
};
h.N = function() {
  return Math.ceil((this.end - this.start) / this.step);
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return Uc(this, b);
};
h.ga = function(a, b, c) {
  for (a = this.start;;) {
    if (0 < this.step ? a < this.end : a > this.end) {
      c = b.g ? b.g(c, a) : b.call(null, c, a);
      if (Tc(c)) {
        return Gb(c);
      }
      a += this.step;
    } else {
      return c;
    }
  }
};
h.ha = function() {
  return this.start;
};
h.ja = function() {
  var a = this.ba();
  return null == a ? Ic : a;
};
h.P = function() {
  return this;
};
h.yb = function() {
  this.Db();
  return this.X;
};
h.bb = function() {
  this.Db();
  return null == this.Ka ? Ic : this.Ka;
};
h.V = function(a, b) {
  return b === this.v ? this : new Ig(b, this.start, this.end, this.step, this.X, this.Ka, this.A);
};
h.Y = function(a, b) {
  return fd(b, this);
};
h.Kb = function() {
  return A(this.bb(null));
};
Ig.prototype[Ya] = function() {
  return Kc(this);
};
function Jg(a, b, c, d, e, f, g) {
  this.v = a;
  this.start = b;
  this.end = c;
  this.step = d;
  this.X = e;
  this.Ka = f;
  this.A = g;
  this.G = 140800;
  this.o = 32374988;
}
h = Jg.prototype;
h.toString = function() {
  return qc(this);
};
h.equiv = function(a) {
  return this.D(null, a);
};
h.indexOf = function() {
  var a = null;
  a = function(b, c) {
    switch(arguments.length) {
      case 1:
        return F(this, b, 0);
      case 2:
        return F(this, b, c);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  a.h = function(b) {
    return F(this, b, 0);
  };
  a.g = function(b, c) {
    return F(this, b, c);
  };
  return a;
}();
h.lastIndexOf = function() {
  function a(c) {
    return bd(this, c, H(this));
  }
  var b = null;
  b = function(c, d) {
    switch(arguments.length) {
      case 1:
        return a.call(this, c);
      case 2:
        return bd(this, c, d);
    }
    throw Error("Invalid arity: " + arguments.length);
  };
  b.h = a;
  b.g = function(c, d) {
    return bd(this, c, d);
  };
  return b;
}();
h.Db = function() {
  if (null == this.X) {
    var a = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null];
    a: {
      var b = 0;
      for (var c = this.start;;) {
        if (32 > b) {
          if (a[b] = c, b += 1, c += this.step, !(0 < this.step ? c < this.end : c > this.end)) {
            b = this.X = new ne(a, 0, b);
            break a;
          }
        } else {
          b = c;
          break a;
        }
      }
    }
    null == this.X && (this.X = new ne(a, 0, 32), (0 < this.step ? b < this.end : b > this.end) && (this.Ka = new Jg(null, b, this.end, this.step, null, null, null)));
  }
};
h.za = function() {
  return new Hg(this.start, this.end, this.step);
};
h.U = function() {
  return this.v;
};
h.ba = function() {
  return 0 < this.step ? this.start + this.step < this.end ? new Jg(null, this.start + this.step, this.end, this.step, null, null, null) : null : this.start + this.step > this.end ? new Jg(null, this.start + this.step, this.end, this.step, null, null, null) : null;
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = Nc(this);
};
h.D = function(a, b) {
  return ed(this, b);
};
h.$ = function() {
  return Ic;
};
h.fa = function(a, b) {
  return hd(b, this);
};
h.ga = function(a, b, c) {
  for (a = this.start;;) {
    if (0 < this.step ? a < this.end : a > this.end) {
      c = b.g ? b.g(c, a) : b.call(null, c, a);
      if (Tc(c)) {
        return Gb(c);
      }
      a += this.step;
    } else {
      return c;
    }
  }
};
h.ha = function() {
  return this.start;
};
h.ja = function() {
  var a = this.ba();
  return null == a ? Ic : a;
};
h.P = function() {
  return this;
};
h.yb = function() {
  this.Db();
  return this.X;
};
h.bb = function() {
  this.Db();
  return null == this.Ka ? Ic : this.Ka;
};
h.V = function(a, b) {
  return b === this.v ? this : new Jg(b, this.start, this.end, this.step, this.X, this.Ka, this.A);
};
h.Y = function(a, b) {
  return fd(b, this);
};
h.Kb = function() {
  return A(this.bb(null));
};
Jg.prototype[Ya] = function() {
  return Kc(this);
};
function Kg(a) {
  a: {
    for (var b = a;;) {
      if (b = A(b)) {
        b = C(b);
      } else {
        break a;
      }
    }
  }
  return a;
}
function Lg(a, b) {
  if ("string" === typeof b) {
    return a = a.exec(b), null != a && E.g(a[0], b) ? 1 === a.length ? a[0] : Ff(a) : null;
  }
  throw new TypeError("re-matches must match against a string.");
}
var Mg = function Mg(a, b) {
  var d = a.exec(b);
  if (null == d) {
    return null;
  }
  var e = d[0], f = 1 === d.length ? e : Ff(d);
  return fd(f, new ke(null, function() {
    var g = e.length;
    g = d.index + (1 > g ? 1 : g);
    return g <= b.length ? (g = b.substring(g), Mg.g ? Mg.g(a, g) : Mg.call(null, a, g)) : null;
  }, null));
};
function Ng(a, b) {
  if ("string" === typeof b) {
    return Mg(a, b);
  }
  throw new TypeError("re-seq must match against a string.");
}
function Og(a, b, c, d, e, f, g) {
  var k = Ga;
  Ga = null == Ga ? null : Ga - 1;
  try {
    if (null != Ga && 0 > Ga) {
      return Yb(a, "#");
    }
    Yb(a, c);
    if (0 === Pa.h(f)) {
      A(g) && Yb(a, function() {
        var y = Pg.h(f);
        return t(y) ? y : "...";
      }());
    } else {
      if (A(g)) {
        var l = B(g);
        b.i ? b.i(l, a, f) : b.call(null, l, a, f);
      }
      for (var m = C(g), n = Pa.h(f) - 1;;) {
        if (!m || null != n && 0 === n) {
          A(m) && 0 === n && (Yb(a, d), Yb(a, function() {
            var y = Pg.h(f);
            return t(y) ? y : "...";
          }()));
          break;
        } else {
          Yb(a, d);
          var q = B(m);
          c = a;
          g = f;
          b.i ? b.i(q, c, g) : b.call(null, q, c, g);
          var v = C(m);
          c = n - 1;
          m = v;
          n = c;
        }
      }
    }
    return Yb(a, e);
  } finally {
    Ga = k;
  }
}
function Qg(a, b) {
  b = A(b);
  for (var c = null, d = 0, e = 0;;) {
    if (e < d) {
      var f = c.M(null, e);
      Yb(a, f);
      e += 1;
    } else {
      if (b = A(b)) {
        c = b, Dd(c) ? (b = ic(c), d = jc(c), c = b, f = H(b), b = d, d = f) : (f = B(c), Yb(a, f), b = C(c), c = null, d = 0), e = 0;
      } else {
        return null;
      }
    }
  }
}
function Rg(a) {
  if (null == Ca) {
    throw Error("No *print-fn* fn set for evaluation environment");
  }
  Ca.h ? Ca.h(a) : Ca.call(null, a);
  return null;
}
var Sg = {'"':'\\"', "\\":"\\\\", "\b":"\\b", "\f":"\\f", "\n":"\\n", "\r":"\\r", "\t":"\\t"};
function Tg(a) {
  return ['"', u.h(a.replace(/[\\"\b\f\n\r\t]/g, function(b) {
    return Sg[b];
  })), '"'].join("");
}
function Ug(a, b) {
  return (a = Gd(w.g(a, Na))) ? (a = null != b ? b.o & 131072 || p === b.qc ? !0 : !1 : !1) ? null != vd(b) : a : a;
}
function Vg(a, b, c) {
  if (null == a) {
    return Yb(b, "nil");
  }
  Ug(c, a) && (Yb(b, "^"), Wg(vd(a), b, c), Yb(b, " "));
  if (a.Zb) {
    return a.zc(b);
  }
  if (null != a ? a.o & 2147483648 || p === a.Z || (a.o ? 0 : Ua(Zb, a)) : Ua(Zb, a)) {
    return $b(a, b, c);
  }
  if (!0 === a || !1 === a) {
    return Yb(b, u.h(a));
  }
  if ("number" === typeof a) {
    return Yb(b, isNaN(a) ? "##NaN" : a === Number.POSITIVE_INFINITY ? "##Inf" : a === Number.NEGATIVE_INFINITY ? "##-Inf" : u.h(a));
  }
  if (null != a && a.constructor === Object) {
    return Yb(b, "#js "), Xg(af.g(function(d) {
      return new Cf(null != Lg(/[A-Za-z_\*\+\?!\-'][\w\*\+\?!\-']*/, d) ? ie.h(d) : d, a[d]);
    }, ra(a)), b, c);
  }
  if (Ra(a)) {
    return Og(b, Wg, "#js [", " ", "]", c, a);
  }
  if ("string" === typeof a) {
    return t(Ma.h(c)) ? Yb(b, Tg(a)) : Yb(b, a);
  }
  if ("function" === typeof a) {
    return c = a.name, c = null == c || /^[\s\xa0]*$/.test(c) ? "Function" : c, Qg(b, gd(["#object[", c, t(!1) ? [' "', u.h(a), '"'].join("") : "", "]"]));
  }
  if (a instanceof Date) {
    return c = function(d, e) {
      for (d = u.h(d);;) {
        if (d.length < e) {
          d = ["0", d].join("");
        } else {
          return d;
        }
      }
    }, Qg(b, gd(['#inst "', c(a.getUTCFullYear(), 4), "-", c(a.getUTCMonth() + 1, 2), "-", c(a.getUTCDate(), 2), "T", c(a.getUTCHours(), 2), ":", c(a.getUTCMinutes(), 2), ":", c(a.getUTCSeconds(), 2), ".", c(a.getUTCMilliseconds(), 3), "-", '00:00"']));
  }
  if (a instanceof RegExp) {
    return Qg(b, gd(['#"', a.source, '"']));
  }
  if ("symbol" === ba(a) || "undefined" !== typeof Symbol && a instanceof Symbol) {
    return Qg(b, gd(["#object[", a.toString(), "]"]));
  }
  if (t(function() {
    var d = null == a ? null : a.constructor;
    return null == d ? null : d.Lb;
  }())) {
    return Qg(b, gd(["#object[", a.constructor.Lb.replace(/\//g, "."), "]"]));
  }
  c = function() {
    var d = null == a ? null : a.constructor;
    return null == d ? null : d.name;
  }();
  c = null == c || /^[\s\xa0]*$/.test(c) ? "Object" : c;
  return null == a.constructor ? Qg(b, gd(["#object[", c, "]"])) : Qg(b, gd(["#object[", c, " ", u.h(a), "]"]));
}
function Wg(a, b, c) {
  var d = Yg.h(c);
  return t(d) ? (c = pd.i(c, Zg, Vg), d.i ? d.i(a, b, c) : d.call(null, a, b, c)) : Vg(a, b, c);
}
function $g(a, b) {
  if (wd(a)) {
    b = "";
  } else {
    var c = u, d = c.h, e = new xa, f = new pc(e);
    Wg(B(a), f, b);
    a = A(C(a));
    for (var g = null, k = 0, l = 0;;) {
      if (l < k) {
        var m = g.M(null, l);
        Yb(f, " ");
        Wg(m, f, b);
        l += 1;
      } else {
        if (a = A(a)) {
          g = a, Dd(g) ? (a = ic(g), k = jc(g), g = a, m = H(a), a = k, k = m) : (m = B(g), Yb(f, " "), Wg(m, f, b), a = C(g), g = null, k = 0), l = 0;
        } else {
          break;
        }
      }
    }
    b = d.call(c, e);
  }
  return b;
}
function ah(a) {
  var b = pd.i(Ja(), Ma, !1);
  return Rg($g(a, b));
}
var bh = function() {
  function a(b) {
    var c = null;
    if (0 < arguments.length) {
      c = 0;
      for (var d = Array(arguments.length - 0); c < d.length;) {
        d[c] = arguments[c + 0], ++c;
      }
      c = new Fc(d, 0, null);
    }
    return ah(c);
  }
  a.C = 0;
  a.B = function(b) {
    b = A(b);
    return ah(b);
  };
  a.m = function(b) {
    return ah(b);
  };
  return a;
}(), ch = function ch(a) {
  for (var c = [], d = arguments.length, e = 0;;) {
    if (e < d) {
      c.push(arguments[e]), e += 1;
    } else {
      break;
    }
  }
  return ch.m(0 < c.length ? new Fc(c.slice(0), 0, null) : null);
};
ch.m = function(a) {
  ah(a);
  t(Fa) ? (a = Ja(), Rg("\n"), a = (w.g(a, Ka), null)) : a = null;
  return a;
};
ch.C = 0;
ch.B = function(a) {
  return this.m(A(a));
};
function dh(a) {
  return a instanceof Cc ? Dc.g(null, je(a)) : ie.g(null, je(a));
}
function eh(a) {
  if (t(!1)) {
    var b = A(a), c = A(b), d = B(c);
    C(c);
    I(d, 0);
    I(d, 1);
    c = nd(a);
    for (a = null;;) {
      d = a;
      b = A(b);
      a = B(b);
      var e = C(b), f = a;
      a = I(f, 0);
      b = I(f, 1);
      if (t(f)) {
        if (a instanceof z || a instanceof Cc) {
          if (t(d)) {
            if (E.g(d, he(a))) {
              c = pd.i(c, dh(a), b), a = d, b = e;
            } else {
              return null;
            }
          } else {
            if (d = he(a), t(d)) {
              c = pd.i(c, dh(a), b), a = d, b = e;
            } else {
              return null;
            }
          }
        } else {
          return null;
        }
      } else {
        return new K(null, 2, 5, L, [d, c], null);
      }
    }
  } else {
    return null;
  }
}
function fh(a, b, c, d, e) {
  return Og(d, function(f, g, k) {
    var l = zb(f);
    c.i ? c.i(l, g, k) : c.call(null, l, g, k);
    Yb(g, " ");
    f = Ab(f);
    return c.i ? c.i(f, g, k) : c.call(null, f, g, k);
  }, [u.h(a), "{"].join(""), ", ", "}", e, A(b));
}
function Xg(a, b, c) {
  var d = Wg, e = Ad(a) ? eh(a) : null, f = I(e, 0);
  e = I(e, 1);
  return t(f) ? fh(["#:", u.h(f)].join(""), e, d, b, c) : fh(null, a, d, b, c);
}
Fc.prototype.Z = p;
Fc.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
ke.prototype.Z = p;
ke.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
Cf.prototype.Z = p;
Cf.prototype.O = function(a, b, c) {
  return Og(b, Wg, "[", " ", "]", c, this);
};
og.prototype.Z = p;
og.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
Uf.prototype.Z = p;
Uf.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
Lc.prototype.Z = p;
Lc.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
Ef.prototype.Z = p;
Ef.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
ee.prototype.Z = p;
ee.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
dd.prototype.Z = p;
dd.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
Ig.prototype.Z = p;
Ig.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
rg.prototype.Z = p;
rg.prototype.O = function(a, b, c) {
  return Xg(this, b, c);
};
pg.prototype.Z = p;
pg.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
Hf.prototype.Z = p;
Hf.prototype.O = function(a, b, c) {
  return Og(b, Wg, "[", " ", "]", c, this);
};
Ag.prototype.Z = p;
Ag.prototype.O = function(a, b, c) {
  return Og(b, Wg, "#{", " ", "}", c, this);
};
oe.prototype.Z = p;
oe.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
We.prototype.Z = p;
We.prototype.O = function(a, b, c) {
  Yb(b, "#object[cljs.core.Atom ");
  Wg(new r(null, 1, [gh, this.state], null), b, c);
  return Yb(b, "]");
};
xg.prototype.Z = p;
xg.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
ef.prototype.Z = p;
ef.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
K.prototype.Z = p;
K.prototype.O = function(a, b, c) {
  return Og(b, Wg, "[", " ", "]", c, this);
};
ce.prototype.Z = p;
ce.prototype.O = function(a, b) {
  return Yb(b, "()");
};
r.prototype.Z = p;
r.prototype.O = function(a, b, c) {
  return Xg(this, b, c);
};
Jg.prototype.Z = p;
Jg.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
wg.prototype.Z = p;
wg.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
md.prototype.Z = p;
md.prototype.O = function(a, b, c) {
  return Og(b, Wg, "(", " ", ")", c, this);
};
Cc.prototype.mb = p;
Cc.prototype.ib = function(a, b) {
  if (b instanceof Cc) {
    return Bc(this, b);
  }
  throw Error(["Cannot compare ", u.h(this), " to ", u.h(b)].join(""));
};
z.prototype.mb = p;
z.prototype.ib = function(a, b) {
  if (b instanceof z) {
    return fe(this, b);
  }
  throw Error(["Cannot compare ", u.h(this), " to ", u.h(b)].join(""));
};
Hf.prototype.mb = p;
Hf.prototype.ib = function(a, b) {
  if (Cd(b)) {
    return Kd(this, b);
  }
  throw Error(["Cannot compare ", u.h(this), " to ", u.h(b)].join(""));
};
K.prototype.mb = p;
K.prototype.ib = function(a, b) {
  if (Cd(b)) {
    return Kd(this, b);
  }
  throw Error(["Cannot compare ", u.h(this), " to ", u.h(b)].join(""));
};
Cf.prototype.mb = p;
Cf.prototype.ib = function(a, b) {
  if (Cd(b)) {
    return Kd(this, b);
  }
  throw Error(["Cannot compare ", u.h(this), " to ", u.h(b)].join(""));
};
function hh() {
}
function ih(a) {
  if (null != a && null != a.mc) {
    a = a.mc(a);
  } else {
    var b = ih[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = ih._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("IEncodeJS.-clj-\x3ejs", a);
      }
    }
  }
  return a;
}
function jh(a, b) {
  return (null != a ? p === a.lc || (a.Sb ? 0 : Ua(hh, a)) : Ua(hh, a)) ? ih(a) : "string" === typeof a || "number" === typeof a || a instanceof z || a instanceof Cc ? b.h ? b.h(a) : b.call(null, a) : $g(gd([a]), Ja());
}
var kh = function kh(a) {
  for (var c = [], d = arguments.length, e = 0;;) {
    if (e < d) {
      c.push(arguments[e]), e += 1;
    } else {
      break;
    }
  }
  return kh.m(arguments[0], 1 < c.length ? new Fc(c.slice(1), 0, null) : null);
};
kh.m = function(a, b) {
  b = De(b);
  var c = w.i(b, lh, je), d = function g(f) {
    if (null == f) {
      return null;
    }
    if (null != f ? p === f.lc || (f.Sb ? 0 : Ua(hh, f)) : Ua(hh, f)) {
      return ih(f);
    }
    if (f instanceof z) {
      return c.h ? c.h(f) : c.call(null, f);
    }
    if (f instanceof Cc) {
      return u.h(f);
    }
    if (Ad(f)) {
      var k = {};
      f = A(f);
      for (var l = null, m = 0, n = 0;;) {
        if (n < m) {
          var q = l.M(null, n), v = I(q, 0);
          q = I(q, 1);
          v = jh(v, d);
          q = g(q);
          k[v] = q;
          n += 1;
        } else {
          if (f = A(f)) {
            Dd(f) ? (m = ic(f), f = jc(f), l = m, m = H(m)) : (m = B(f), l = I(m, 0), m = I(m, 1), l = jh(l, d), m = g(m), k[l] = m, f = C(f), l = null, m = 0), n = 0;
          } else {
            break;
          }
        }
      }
      return k;
    }
    if (xd(f)) {
      k = [];
      f = A(af.g(g, f));
      l = null;
      for (n = m = 0;;) {
        if (n < m) {
          v = l.M(null, n), k.push(v), n += 1;
        } else {
          if (f = A(f)) {
            l = f, Dd(l) ? (f = ic(l), n = jc(l), l = f, m = H(f), f = n) : (f = B(l), k.push(f), f = C(l), l = null, m = 0), n = 0;
          } else {
            break;
          }
        }
      }
      return k;
    }
    return f;
  };
  return d(a);
};
kh.C = 1;
kh.B = function(a) {
  var b = B(a);
  a = C(a);
  return this.m(b, a);
};
function mh() {
}
function nh(a, b) {
  if (null != a && null != a.kc) {
    a = a.kc(a, b);
  } else {
    var c = nh[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = nh._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("IEncodeClojure.-js-\x3eclj", a);
      }
    }
  }
  return a;
}
function oh(a) {
  return ph(a, gd([qh, !1]));
}
function ph(a, b) {
  var c = De(b);
  c = w.g(c, qh);
  var d = t(c) ? ie : u;
  return function g(f) {
    return (null != f ? p === f.Ic || (f.Sb ? 0 : Ua(mh, f)) : Ua(mh, f)) ? nh(f, Be(vg, b)) : (null == f ? 0 : null != f ? f.o & 64 || p === f.qb || (f.o ? 0 : Ua(mb, f)) : Ua(mb, f)) ? Kg(af.g(g, f)) : Gf(f) ? new Cf(g(zb(f)), g(Ab(f))) : xd(f) ? jf(nd(f), af.h(g), f) : Ra(f) ? cc(ab(function(k, l) {
      return ue.g(k, g(l));
    }, ac(ld), f)) : Va(f) === Object ? cc(ab(function(k, l) {
      var m = d.h ? d.h(l) : d.call(null, l);
      l = g(null !== f && l in f ? f[l] : void 0);
      return dc(k, m, l);
    }, ac(Ge), ra(f))) : f;
  }(a);
}
function rh(a, b) {
  var c = Error(a);
  this.message = a;
  this.data = b;
  this.Vb = null;
  this.name = c.name;
  this.description = c.description;
  this.fileName = c.fileName;
  this.lineNumber = c.lineNumber;
  this.columnNumber = c.columnNumber;
  this.stack = c.stack;
  return this;
}
rh.prototype.__proto__ = Error.prototype;
rh.prototype.Z = p;
rh.prototype.O = function(a, b, c) {
  Yb(b, "#error {:message ");
  Wg(this.message, b, c);
  t(this.data) && (Yb(b, ", :data "), Wg(this.data, b, c));
  t(this.Vb) && (Yb(b, ", :cause "), Wg(this.Vb, b, c));
  return Yb(b, "}");
};
rh.prototype.toString = function() {
  return qc(this);
};
function sh(a, b) {
  return new rh(a, b);
}
if ("undefined" === typeof ya || "undefined" === typeof Aa || "undefined" === typeof th) {
  var th = null;
}
"undefined" !== typeof console && (Fa = !1, Ca = function() {
  return console.log.apply(console, ma(arguments));
}, Ea = function() {
  return console.error.apply(console, ma(arguments));
});
if ("undefined" === typeof ya || "undefined" === typeof Aa || "undefined" === typeof uh) {
  var uh = function() {
    throw Error("cljs.core/*eval* not bound");
  };
}
;var vh = new z(null, "coat", "coat", -222634880), wh = new z(null, "tortie", "tortie", 266598528), xh = new z(null, "genesis-group", "genesis-group", 2082390176), yh = new z(null, "hue", "hue", -508078848), zh = new z(null, "description", "description", -1428560544), Ah = new z(null, "available-supply", "available-supply", 1090548416), Bh = new z(null, "glow-color", "glow-color", 1432165216), Ch = new z(null, "mooncattraits", "mooncattraits", -1687429280), Dh = new z(null, "k-int", "k-int", -1099450464), 
Eh = new z(null, "capabilities", "capabilities", 212739361), Fh = new z(null, "hero", "hero", 1983137057), Gh = new z(null, "only-child", "only-child", -1420502495), Hh = new z(null, "is-pale", "is-pale", -803371998), Ih = new z(null, "max_value", "max_value", -1047480286), Jh = new z(null, "address", "address", 559499426), Kh = new z(null, "deprecated-unofficial-mooncat-wrapper", "deprecated-unofficial-mooncat-wrapper", 1556327682), Lh = new z(null, "orange", "orange", 73816386), Mh = new z(null, 
"litter-id", "litter-id", 1862730114), Nh = new z(null, "noCat", "noCat", -713839102), Oh = new z(null, "rescue-order", "rescue-order", 1514830402), N = new z(null, "rgba", "rgba", -2032958718), Ph = new z(null, "r", "r", -471384190), Qh = new z(null, "cat-id", "cat-id", 963362371), Rh = new z(null, "image-width", "image-width", 737630851), Sh = new z(null, "glowOpacity", "glowOpacity", -435642493), Th = new z(null, "rescue", "rescue", 1135767523), Uh = new z(null, "expression", "expression", 202311876), 
Vh = new z(null, "palettes", "palettes", -1924812604), Wh = new z(null, "grey-brown", "grey-brown", 12429604), Xh = new z(null, "register-x", "register-x", -1406378588), Yh = new z(null, "mirrorAccessory", "mirrorAccessory", -1417486844), Na = new z(null, "meta", "meta", 1499536964), Zh = new z(null, "pouncing", "pouncing", 515934820), $h = new z(null, "glow-opacity", "glow-opacity", 1677953732), ai = new z(null, "sky-blue", "sky-blue", -1418478587), bi = new z(null, "color", "color", 1011675173), 
ci = new z(null, "clone-set", "clone-set", 1039183141), Oa = new z(null, "dup", "dup", 556298533), di = new z(null, "hues", "hues", 462381541), ei = new z(null, "lootprintsformooncats", "lootprintsformooncats", -550019579), fi = new z(null, "tinted-glass", "tinted-glass", -1178129691), gi = new z(null, "smoked-glass", "smoked-glass", 720641957), hi = new z(null, "index", "index", -1531685915), ii = new z(null, "bottom", "bottom", -1550509018), ji = new z(null, "white", "white", -483998618), ki = 
new z(null, "standing", "standing", -1248340762), li = new z(null, "number", "number", 1570378438), mi = new z(null, "image-left", "image-left", 185555814), ni = new z(null, "scale", "scale", -230427353), oi = new z(null, "top", "top", -1856271961), pi = new z(null, "mooncatrescue", "mooncatrescue", -89635385), qi = new z(null, "extended", "extended", -1515212057), ri = new z(null, "yellow", "yellow", -881035449), si = new z(null, "idat", "idat", 1605839880), ti = new z(null, "mirror-accessory", 
"mirror-accessory", 463246536), ui = new z(null, "grey-glass", "grey-glass", 1611853192), vi = new z(null, "mooncataccessoryimages", "mooncataccessoryimages", 672665352), wi = new z(null, "patterns", "patterns", 1164082024), xi = new z(null, "owned-accessory-index", "owned-accessory-index", 7985032), yi = new z(null, "offset-y", "offset-y", 2076844008), zi = new z(null, "name", "name", 1843675177), Ai = new z(null, "contract", "contract", 798152745), Bi = new z(null, "fullSize", "fullSize", 1020387625), 
Ci = new z(null, "accessory-id", "accessory-id", 1488782697), Di = new z(null, "palette", "palette", -456203511), Ei = new z(null, "background_color", "background_color", -1953390743), Fi = new z(null, "value", "value", 305978217), Gi = new z(null, "grumpy", "grumpy", -749393015), Hi = new z(null, "foreground-glow", "foreground-glow", -308178999), Ii = new z(null, "green", "green", -945526839), Ji = new z(null, "background-color", "background-color", 570434026), Ki = new z(null, "cyan", "cyan", 1118839274), 
Li = new z(null, "image-top", "image-top", -155998742), Mi = new z(null, "sleeping", "sleeping", -1878480086), Ni = new z(null, "token-id", "token-id", -764089526), O = new z(null, "width", "width", -384071477), Oi = new z(null, "background", "background", -863952629), Pi = new z(null, "facing", "facing", -854439413), Qi = new z(null, "mooncatcolors", "mooncatcolors", 541656619), Ri = new z(null, "mooncataccessories", "mooncataccessories", 2010902059), Si = new z(null, "idat-hex", "idat-hex", 74479724), 
Ti = new z(null, "has-twins", "has-twins", 1383105676), gh = new z(null, "val", "val", 128701612), Ui = new z(null, "litter", "litter", -637726388), Vi = new z(null, "mirrorPlacement", "mirrorPlacement", -241452660), Wi = new z(null, "background-pixels", "background-pixels", -991109460), Xi = new z(null, "twin-id", "twin-id", 276437804), Yi = new z(null, "invalid", "invalid", 412869516), Zi = new z(null, "facings", "facings", 1625270605), Zg = new z(null, "fallback-impl", "fallback-impl", -1501286995), 
lh = new z(null, "keyword-fn", "keyword-fn", -64566675), $i = new z(null, "rpc-error", "rpc-error", 1320789805), Ka = new z(null, "flush-on-newline", "flush-on-newline", -151457939), aj = new z(null, "bays", "bays", 1408825934), bj = new z(null, "normal", "normal", -1519123858), cj = new z(null, "image-height", "image-height", -1587384498), dj = new z(null, "trait_type", "trait_type", 1310201710), ej = new z(null, "full-size", "full-size", -452711442), fj = new z(null, "pales", "pales", 31337519), 
gj = new z(null, "foreground-layers", "foreground-layers", -2091394833), hj = new z(null, "classification", "classification", 150369615), R = new z(null, "title", "title", 636505583), ij = new z(null, "abiJSON", "abiJSON", -1246187857), jj = new z(null, "dark", "dark", 1818973999), kj = new z(null, "pale", "pale", 2121540688), Ma = new z(null, "readably", "readably", 1129599760), lj = new z(null, "chartreuse", "chartreuse", -1626529775), Pg = new z(null, "more-marker", "more-marker", -14717935), 
mj = new z(null, "g", "g", 1738089905), nj = new z(null, "reason", "reason", -2070751759), oj = new z(null, "k-bin", "k-bin", 601516529), pj = new z(null, "has-clones", "has-clones", 172273329), qj = new z(null, "warning", "warning", -1685650671), rj = new z(null, "price-wei", "price-wei", 114205842), sj = new z(null, "manager", "manager", -818607470), tj = new z(null, "twin-set-size", "twin-set-size", -321199342), uj = new z(null, "mooncatsvgs", "mooncatsvgs", -1231214734), vj = new z(null, "success", 
"success", 1890645906), Od = new z(null, "z-index", "z-index", 1892827090), wj = new z(null, "details", "details", 1956795411), xj = new z(null, "litter-size", "litter-size", -762583949), yj = new z(null, "head-only", "head-only", 2054631731), zj = new z(null, "stained-glass", "stained-glass", -829031085), Aj = new z(null, "http-status", "http-status", -1426786925), Bj = new z(null, "total-supply", "total-supply", 1447638579), Cj = new z(null, "result", "result", 1415092211), Dj = new z(null, "mirror-set-size", 
"mirror-set-size", 1735322740), Pa = new z(null, "print-length", "print-length", 1931866356), S = new z(null, "id", "id", -1388402092), Ej = new z(null, "lunar", "lunar", 1146209908), Fj = new z(null, "class", "class", -2030961996), Gj = new z(null, "red", "red", -969428204), Hj = new z(null, "blue", "blue", -622100620), Ij = new z(null, "expressions", "expressions", 255689909), Jj = new z(null, "padding", "padding", 1660304693), Kj = new z(null, "mooncatreference", "mooncatreference", -1761694283), 
Lj = new z(null, "abi", "abi", -1999451499), Mj = new z(null, "offset-x", "offset-x", 1036466230), Nj = new z(null, "bit-length", "bit-length", -1661803274), Oj = new z(null, "audience", "audience", -109542122), Pj = new z(null, "no-cat", "no-cat", -1928216234), Qj = new z(null, "mirror-placement", "mirror-placement", -1915703946), Rj = new z(null, "length", "length", 588987862), Sj = new z(null, "headOnly", "headOnly", -293308874), Tj = new z(null, "spotted", "spotted", 183372374), Uj = new z(null, 
"is-acclimated", "is-acclimated", 267546294), Vj = new z(null, "b", "b", 1482224470), Wj = new z(null, "pose", "pose", 1371025270), Xj = new z(null, "fuchsia", "fuchsia", 990719926), Yj = new z(null, "rescue-index", "rescue-index", -651662378), Zj = new z(null, "tabby", "tabby", 1471565814), ak = new z(null, "reserved", "reserved", -775228297), bk = new z(null, "zIndex", "zIndex", -1588341609), ck = new z(null, "stalking", "stalking", 1350522167), dk = new z(null, "poses", "poses", -120129129), ek = 
new z(null, "right", "right", -452581833), fk = new z(null, "paletteIndex", "paletteIndex", -199244201), gk = new z(null, "eligible-list", "eligible-list", -724902057), hk = new z(null, "palette-fn", "palette-fn", 1370849207), ik = new z(null, "rescued-by", "rescued-by", 809112567), jk = new z(null, "pouting", "pouting", 71321591), kk = new z(null, "erc721", "erc721", 575444120), lk = new z(null, "order", "order", -1254677256), mk = new z(null, "basic", "basic", 1043717368), nk = new z(null, "clone-id", 
"clone-id", -791833256), ok = new z(null, "teal", "teal", 1231496088), pk = new z(null, "magenta", "magenta", 1687937081), qk = new z(null, "background-layers", "background-layers", 497083577), rk = new z(null, "available", "available", -1470697127), sk = new z(null, "genesis", "genesis", -185439623), tk = new z(null, "glowSize", "glowSize", -327220166), uk = new z(null, "vintage", "vintage", 818195578), vk = new z(null, "twin-set", "twin-set", 893675034), wk = new z(null, "purple", "purple", -876021126), 
xk = new z(null, "binary-string", "binary-string", -99636518), yk = new z(null, "mirror", "mirror", 1914600218), zk = new z(null, "pure", "pure", 1433370394), Ak = new z(null, "rescue-year", "rescue-year", -1914099685), Bk = new z(null, "mooncatacclimator", "mooncatacclimator", 794363995), Ck = new z(null, "deep", "deep", 2090866875), Dk = new z(null, "light", "light", 1918998747), Ek = new z(null, "foreground-pixels", "foreground-pixels", 1894373851), Fk = new z(null, "available-palettes", "available-palettes", 
-696614277), Gk = new z(null, "pixels", "pixels", -40523077), Yg = new z(null, "alt-impl", "alt-impl", 670969595), Hk = new z(null, "backgroundColor", "backgroundColor", 1738438491), Ik = new z(null, "palette-index", "palette-index", 1742097339), Jk = new z(null, "attributes", "attributes", -74013604), Kk = new z(null, "cat-name", "cat-name", -791588548), Lk = new z(null, "price-eth", "price-eth", -671452868), T = new z(null, "raw-pixels", "raw-pixels", -412723876), qh = new z(null, "keywordize-keys", 
"keywordize-keys", 1310784252), Mk = new z(null, "mirror-id", "mirror-id", 310647837), Nk = new z(null, "smiling", "smiling", -319507395), Ok = new z(null, "shy", "shy", 1888043229), Pk = new z(null, "glow", "glow", 216329469), Qk = new z(null, "owner", "owner", -392611939), Rk = new z(null, "verified", "verified", 1807036606), Sk = new z(null, "register-y", "register-y", -426195714), Tk = new z(null, "img", "img", 1442687358), Uk = new z(null, "mirror-set", "mirror-set", -1918145026), Vk = new z(null, 
"has-mirrors", "has-mirrors", 2014831262), Wk = new z(null, "glow-size", "glow-size", -43896002), Xk = new z(null, "positions", "positions", -1380538434), W = new z(null, "height", "height", 1025178622), Yk = new z(null, "background-glow", "background-glow", 928206879), Zk = new z(null, "clone-set-size", "clone-set-size", -799727521), $k = new z(null, "left", "left", -399115937), al = new z(null, "pattern", "pattern", 242135423), bl = new z(null, "html", "html", -998796897), cl = new z(null, "hue-value", 
"hue-value", 575749535), dl = new z(null, "data", "data", -232669377), el = new z(null, "black", "black", 1294279647);
function fl(a, b, c) {
  var d = t(b.ignoreCase) ? "gi" : "g";
  d = t(b.multiline) ? [d, "m"].join("") : d;
  return a.replace(new RegExp(b.source, t(b.Tc) ? [d, "u"].join("") : d), c);
}
function gl(a) {
  return function() {
    function b(d) {
      var e = null;
      if (0 < arguments.length) {
        e = 0;
        for (var f = Array(arguments.length - 0); e < f.length;) {
          f[e] = arguments[e + 0], ++e;
        }
        e = new Fc(f, 0, null);
      }
      return c.call(this, e);
    }
    function c(d) {
      d = df(d);
      if (E.g(H(d), 1)) {
        return d = B(d), a.h ? a.h(d) : a.call(null, d);
      }
      d = Ff(d);
      return a.h ? a.h(d) : a.call(null, d);
    }
    b.C = 0;
    b.B = function(d) {
      d = A(d);
      return c(d);
    };
    b.m = c;
    return b;
  }();
}
function il(a, b, c) {
  if ("string" === typeof b) {
    return a.replace(new RegExp(String(b).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08"), "g"), c);
  }
  if (b instanceof RegExp) {
    return "string" === typeof c ? fl(a, b, c) : fl(a, b, gl(c));
  }
  throw ["Invalid match arg: ", u.h(b)].join("");
}
function jl(a) {
  var b = new xa;
  for (a = A(a);;) {
    if (null != a) {
      b = b.append(u.h(B(a))), a = C(a);
    } else {
      return b.toString();
    }
  }
}
function kl(a, b) {
  var c = new xa;
  for (b = A(b);;) {
    if (null != b) {
      c.append(u.h(B(b))), b = C(b), null != b && c.append(a);
    } else {
      return c.toString();
    }
  }
}
function ll(a) {
  var b = /[\s\-]+/;
  a = "/(?:)/" === u.h(b) ? jd.g(Ff(fd("", af.g(u, A(a)))), "") : Ff(u.h(a).split(b));
  if (1 < H(a)) {
    a: {
      for (;;) {
        if ("" === (null == a ? null : Cb(a))) {
          a = null == a ? null : Db(a);
        } else {
          break a;
        }
      }
    }
  }
  return a;
}
function ml(a) {
  return /^[\s\xa0]*$/.test(null == a ? "" : String(a));
}
;function nl(a) {
  return sa(a, "0x") ? a.substring(2) : a;
}
function ol(a) {
  a = Wd(a);
  a = (0 > a ? a + 256 : a).toString(16);
  return E.g(1, H(a)) ? ["0", u.h(a)].join("") : a;
}
function pl(a) {
  return parseInt(a, 16);
}
function ql(a) {
  a = a.toString(2);
  return [ae("00000000", H(a)), u.h(a)].join("");
}
function rl(a) {
  if (0 !== Xd(H(a), 8)) {
    throw sh("binary string length must be a multiple of 8", new r(null, 2, [Rj, H(a), xk, a], null));
  }
  return jl(af.g(function(b) {
    return parseInt(jl(b), 2).toString(16);
  }, mf(4, a)));
}
function sl(a) {
  a = nl(a);
  a = kf(pl, Ng(/.{2}/, a));
  for (var b = new Uint8Array(H(a)), c = H(a), d = 0;;) {
    if (d < c) {
      b[d] = a.h ? a.h(d) : a.call(null, d), d += 1;
    } else {
      break;
    }
  }
  return b;
}
function tl(a) {
  a = je(a);
  return il(a, /\-(.)/, function(b) {
    I(b, 0);
    return I(b, 1).toUpperCase();
  });
}
;function ul(a) {
  if (Hd(a)) {
    var b = a.toString(2), c = H(b);
    if (8 < c) {
      throw sh("Number too large for bit-length", new r(null, 2, [li, a, Nj, 8], null));
    }
    a = 8 === c ? b : ["00000000".substring(0, 8 - c), u.h(b)].join("");
    return new r(null, 6, [Rk, E.g("1", a.substring(0, 1)), ak, parseInt(jl(gd([a.substring(1, 3)])), 2), Oj, parseInt(jl(gd([a.substring(3, 5)])), 2), Qj, E.g("1", a.substring(5, 6)), ti, E.g("1", a.substring(6, 7)), Oi, E.g("1", a.substring(7))], null);
  }
  return new r(null, 6, [Rk, !1, ak, 0, Oj, 0, Qj, !1, ti, !1, Oi, !1], null);
}
;var vl = kf(function(a) {
  return E.g(8, H(a)) ? ["0x00", u.h(a)].join("") : ["0x", u.h(a)].join("");
}, M("d658d50b 0f53c2fd 27518528 aeea3b67 ff7b7493 cd6a5c05 d8523a53 ac2b3f23 95f2783b 2d6d512c 7794a3f5 304c8e29 80ea1503 f28bec4f ba50ecb2 1cb46c3a 04c4211a 2179a08d 58502e11 13996e82 d6591f3f c1832514 04dd5743 e38e784c 02b77279 5d219414 197db6f0 a33f036d b0d1aab9 1923be57 4ce4b7af bf1f8787 e377fc15 a0ade37e 24057eb5 69b659c0 0d71c4cb b7c50d8a 9fb6c63d 7d228add a51d5060 248b9ea2 0733cff4 f6ab2154 f3c2d145 20bf2c85 545fe901 83441abf 223229dd 8bb3dc81 5fb5a750 1b80923f 684a3006 005d0e2c c61187c8 8d97a0b1 add88a74 ca12456c e09d3ce6 558e579f 02542645 044c1e6f 53fdc06e bc1edac8 8399a1c7 ac0223b6 db8210e1 c877ec48 5cf97a67 33eba426 b19727b0 b9faec3e f52fe14d ce10ee6d d95808e0 d6222e82 3fbbed41 044fddc2 172d6ba6 e155c8f8 0b75a16f 5a123da8 57774705 15137551 ff00000ca7 ff01000ca7 ff02000ca7 ff03000ca7 ff04000ca7 ff05000ca7 ff06000ca7 ff07000ca7 ff08000ca7 ff09000ca7 ff0a000ca7 ff0b000ca7 ff0c000ca7 ff0d000ca7 ff0e000ca7 ff0f000ca7 958b3253 604f616c 62fe7d46 e825a225 16a1311d d4c2bc57 929ec8bf ebac90dc 4609ddf5 9c191b2a 44354873 186b19b7 d5eeb5d3 c645b76a 3f69de46 14ab3db3 76cf5b43 d06ace4c 6e8df5e4 132cf6f4 b208741a 24237a4e 45107365 f18e44d2 68d70cf2 cedc9e18 bf6b942f d404ad48 2603edb1 82206dcb e6263c29 2f80d68c ff8d8bc4 150de7b1 8f797900 04b5e78a 35c04bac 538c45bd 30f34a2e 34a6abbb 272dd45b fb86c27d 798cac55 a8da6446 43ff40a4 290cf662 5eebe406 f3c4784a f0834a7b cb81126a df10d077 653c380b 41b575cf a3e1712e 1952e276 392e3993 bb68b0b7 2ce9e0d4 d063861f d8bef03a b7a9d766 d06db574 54e722cd 5fdeccd2 3fd2be5a 4e66a6b8 869b3bba ed546e8f 97e1dfee 5f3b8b25 f954442c 13687122 c8c89a2b d4b68d8e 18f7e2bb 78be4672 8af82fe8 7e4cf5f2 dcb6e99a 8f27be9f acc7b853 ac8663e3 eeb4c38b 7a560c74 1b2cc3a4 99927576 08d0a5fd bd0adedc 15923c28 14f70bf4 6c822785 7e1ce92b 8d0ab4cf c3b296e4 5e49aabd 3012f3e9 ec7e53a3 2f043d9e 1fa3fa26 fbe6ca30 d2da441a 85a4f997 1023616a 6cfe461d 807ba3f9 eb7082fd a35c6e0d de8908fa 527847ea 9a15930d bbc46a39 a27f8043 ef5d47e9 03368cdf 167fb2a9 1308bcea e2aa2d62 195c62f0 9cfb2a1e 3ca1a514 6403bd8e fb14fe47 b36de473 0dd40487 fe62f668 ea65c572 1db434f6 25cf5fe6 9acb4995 cda8f837 ae0a8158 e5cabeec 627657bd ac102633 8a358b42 3cb954e9 4c71c2dc 1cdb5772 a19c25e7 d4bf84ac 12a9d23b 5963eaea 99730745 3d099595 693b84d7 f47fc9b2 9b89db80 48089a70 7dd75cd2 b59ce0d6 c1aa0a5e d3b3d9de 7c095860 7da44ab0 bf8533e6 a30b8970 40a7edbe 2b691404 a2912fdc bef7c501 183e4650 3ae47d79 25eba5e9 2b5e8f7a e604cb88 0284b5e0 eb86ee36 2bf3f526 c5293b7d cc24b614 9c266096 9a0489ed 62548878 4c961551 d42a2140 197a5fe9 68f4c986 cb793e3b 69139ddb b69ae6d0 71464246 98c8c294 c0497344 0dc188a7 e660ab37 b8410225 1d6e2522 482fa7c1 1a715895 2a1c4676 624d8563 4a1900c2 c3c53cbb b73c2c8b f82e7b88 3571bc96 cf5e5da7 091f6fef bae61078 23590a17 b5535cfa 4ceae4ae 4199e546 cb7e5dfd 30fb2553 bbdc3209 2c702883 32a6f8f2 69784659 14daa3fb 50d78f43 9b8b8a90 f14d99c8 169d5f49 5af40178 5d78c86f 2b664945 3ad22645 dcf81efa e997d45b b9e7497b 01792be7 0087c8bb 6ef26690 b91d22ca 538fa18c 34b49d23 62f8020c 77935743 841b8efe 476ef99c 2d8d227d 5a04b1c7 abd3822f b92e0c26 583f6564 0b13805d ce7ddbba b706b7a3 b2ce8b60 0a2ba752 62e60e07 80d6f651 ccdcb9ae afacc941 1bf66313 e65c8931 c8366fb8 ed738f7a b491b4d5 e0d30e0b 0d0cd97a 85500c89 639fb7de 147ec4b6 108f4b61 b2a5a03d 9b517c4b 3f0a5149 91295691 68f5b6d8 b75df4b5 037fe50c 590a0399 dea8149b b8c23534 9b8bb38d 5921b1e3 51d7009f 87393710 0687d21a 85d5665b ed41662f c4a600c5 5a06654f f326bb41 4446ee57 adf19f30 7fecc745 706fac9a 40508711 17445829 5d08c6f7 628605f5 a343e6e2 ccc481af d328c31b e9175d63 e5a6972d fb892079 a861859d 76e7cc93 d51b8121 01a5111a 185fb2e4 9945b086 9c72201c 6aa78d6f 8d906d9f 5db1ceb4 f9d838e3 f488d4d3 0e396daa 5675e025 6a427b04 5f0e692c 31f88159 b0f2d69b 0388e191 dfe6cb21 1da24b69 057a83d2 d1bad0b9 4aa15183 a3121fb9 f896b245 2de542ba 1d61b97f a936e24a b2a75eb5 2b903046 c0e146e9 c9aee642 43fa6aec 7e60a2d5 ea404106 35f4e1da c880447f d1510c9a 6fb2411a a7476fde c6b4ed54 4e062d20 6253eac9 8f1accc3 0125124b e086c7b8 419137c8 f52f73e0 1f374b74 e325fa64 11681c34 192cc2e2 2eb01ff1 40c74f0b d5f9145d 22d0af88 47629a1e 2ff352bb 3558d3dc c6d7be70 534b2c39 3297e3cd 00352b65 31b52e30 73b1d284 7ba4bd99 c1f2cdf4 62b61016 a3ab20af 04c0b5ce 02f111ae 6d8ad257 28bf58ee b1421759 b3734879 9ebaefae d7f885d1 d3d38d7a 039dac6b 0d8a8cbd 37df8bce bdc90cba 985f496d a817a46a 63e047f6 b0808dbe 7aa8af52 8ef60c70 a5f123ab 8aee6b22 89563dfe e0fab8d1 b0d68a9e 025fb955 238d7797 6fc2fa88 96f57825 01650646 db4871e6 202b5e17 52325154 01833200 aeeba2bb 93ea6487 70a8f3a3 aa9ad0f9 15402dcb bc487c51 890754ba ad0724ce d2b02af0 c39a893d 54130a41 730734ec 06e6167f 3f35525d c835b166 34c914b3 4cf45796 71be40e2 5a2a678f 20b1a217 ab95088d 84d42ae1 863c7a2a 3e1c5dd8 4e3d9eb1 45546bc5 1b47b5f2 55bbf935 30d3919b bcc98a7c 9ed2f424 ff10000ca7 ff11000ca7 ff12000ca7 ff13000ca7 ff14000ca7 ff15000ca7 ff16000ca7 ff17000ca7 ff18000ca7 ff19000ca7 ff1a000ca7 ff1b000ca7 ff1c000ca7 ff1d000ca7 ff1e000ca7 ff1f000ca7 53631adc c6f4e1a1 60c8c62b d7e8c3aa f215d30a 05b3cb41 d4985478 72f065f5 1d57ece5 9d3b59ae 22a10755 82d371e3 4ba80472 adb8faa4 a8d318eb d4c70305 b11e5bf4 717c0446 131d0ffe 5502d60f 225c8282 e1b83f71 afaffdfa 83035684 4bee035a d7788d57 9b21271e a3ca4eee 52759842 44eddf3e f6789d5f 79327270 c6467a3b f31caac3 749fab80 ebc93440 7be96815 78d4f828 1f3dfe81 0e79c671 273460fe dd98483d 8fcecbc6 26e6c71a c5b6517d 5193b6f1 d78419b5 484d8401 f127ad2b 768b7e2a 118deb41 7a6a1af1 8465002e b3813d83 dd59a38b c393d4e0 8c5f5542 70e149d6 e9f23309 54f8e9f9 3f72e49e 2731bf3f b700dded 27a2c784 22aee40a 34e9e0ce 8dc79f5c e8a9e491 a8e31fa4 9d5b998c 1541bca6 39bcfffe 0b471c4a 70fd868c b4e9e83e 02e34556 f22d9b4d c59b9da8 628cf2e7 9e1b0e58 8a46626f 72ac2548 a07166bb 67cfa34c e900ca45 7d638c0f f66fef23 cfbec6c1 ac03d9e1 81438cf0 3587662b b16723b4 1afdd3e1 66d1b28c aa8ad6db e65a67c4 07963716 e8a20ada 11707192 3be40d0c bf334c28 4dbb00e1 f67554b1 f6811d2e 2b76357b 7b629811 c98333e6 662aa109 85239373 651cb9c7 ae353390 517ea6fc 9b044cfc 6d8e2ef0 00cc5dac 1f7fc98d 7584afe9 44b04d04 23506ce1 8179671c 637d17ea 7aef1acb f09fd2e5 e1991394 e5a895a3 c979389a 6eb5fe96 8be2ba25 b558a094 da7b4d85 2585dd0c 7de00a59 e5bb95cb d0646707 1809637f 7ec957e5 4bfcd0cf 3faffe6d 7f0d4ebe 534ea0e0 7fe2bce1 a55a9748 22f46168 fc68258b 735384c6 3a6ede39 5682d7fa 875c990c 2429640e f261c93b 9587f737 8a52a943 e03f9622 49c14af0 fd3f803e a6003b6a 5bb5bf32 c56f5674 416caa6b 2718a119 1c4a5627 247db76e 4e95f679 baca498f b0ae03c9 aa4a0573 5a011d9c efee5172 3b03ba98 5e223a05 dfd2f427 9733d958 a26f8920 71f83aaa cc48126f 6e9b2141 b44a9785 0069b74d 41ffe8aa 129a7f74 6b717d2e 93bb08b0 6888c3b8 a189a9d3 e9163f1b 26ac7dd6 b8f278bc 47e831fb 9c1287ad 2ece9e01 f23efeba 24d97ba3 79cfa7b2 ef53d14d 209c8312 5ccacf4e 3e682ec9 6d4b6d96 df577929 ccb0b791 1ad89d7a 32b18f0f 333e8aa4 f90c0b7c 2fa5632a d7570c82 f7eb7e8e ade4c49d a9054c4c 89caebb5 84e703b9 dece3c6e 5d6adf53 cb070350 6feeded8 d11f7d1b f3360a0d 16c109e7 ef0584d1 3ed4c4d0 fa7fd23e 13cc36b5 3f2dbfb5 7149dc48 df69fa75 d2886fa4 605f5056 f200690b 1c289aab 08406056 7805ac10 f9cb3e2a f38f2cbb 77ddecfb 7bc3cba0 0b4e7254 0851ea0f 2ebd9e46 66d617b5 67da4b85 31271f20 50a11253 44fe2dc6 27b49a8d 43d15fc8 23f6ae24 07d6bf84 40fa0b3c c7a20933 a5ab485e 73c87d71 c6e4598f 3792713d 93f5226e a1ed0ae3 746d2652 a686142e f3f686f0 20c3199e 33de3c60 64b58663 63e98c0b e5aebe9f 5ae98c23 00f18e28 1073fd2e 3aa8550e 1a603d0a 4bfeac1d d7354413 3f396e59 de1c035e 473bf836 71efd4b6 553c9ce1 723ed03f 40cfc564 4b887908 34f0e581 7c4822c7 233c0b55 470aed81 6b8cd26e 50c7ae5a 700704cf 24d7ca59 2f0507fa 792c8457 bf9ffdf2 25b34c49 f3685c9e 4fe2f2ab 7c97fc60 e6b10e6c 23f1ba03 f9a3895b 0a1557e6 55e9d621 aca76f6a e8a63ddb 7bd78c6f cd2237c5 07994cad 2554749e 34a72897 0670706b 7ab1a0a3 5416e03e 8777f414 fa3b2391 b5a3446f 62b86220 22d3d0b5 21a8bc82 c076e098 18ecb369 cb85a73a eb4acce9 c68ea9f9 2a04535c f708a4f3 c9a50246 15cc4481 e8371303 4d6bf0de 608957dc 075ecb65 8a044f1b 482f2376 6e6f2d5c 88d7bcce 3b249930 bdee27ff 140d8533 2892ab14 b5da6f81 bed956d1 d6def008 f393d542 96c3e13a 41bf1f7b 46756f94 fc6f2e0e 61278315 afeea7cb 7e073988 0ab96532 c6d52793 995a907f 0e77f1e8 627d7916 081766aa d43d0468 9926fbfe 25e3f798 32f14b5c 392f68a5 37786229 7642a0b7 0a421716 98f9d72f 4f6259cc a766c850 13e0bf7f c038e5df 42afedaa 4cbe2e09 63cbd805 a4daa635 47d4e036 0cbe6e73 a5b12a98 eb14faad 1e6c8899 57b243a0 9b71b891 2d7f95da d7c0c61a 170936c2 83c3aaa3 f11abce3 66ddbd8f 9f282b8a 39723624 69a112ba 9cf16d24 d7ed2fd3 710967ad fad39211 e1476dc8 4225038e 8ead13d4 bfea5217 e16c5519 ca5078a8 b8a35354 d96de0ef 51d10c02 0d9d6584 19367573 dc29395b 4cb1745d e8755a4e 34503c33 59e5eba3 b821a8ef 4e860ad0 ff8d9206 042e8651 6f1174ed d9cb6824 c88e84cf d54c186e b0fce5ff 4bc432ed a8e53d9e f4710332 84c5218e ed1810f0 5494c441 1ae1e597 1d0393ba ca0cdd92 7cb0605a 785cc2cd ee6cedec 9db82bec f8ecd443 985350c2 5820afe5 859cdfa7 c6c52017 a081ea5f 9730843e 27c694a0 3182cd17 2f439155 08606c15 3526433f 7a3f3796 8e8598cd 701b70a4 f09abc3b 5536e962 fd8a58b1 f1e05064 a3c77658 8012590a 47a24f10 d63513d3 45a39725 f2def2c8 379cc3b2 700a71a1 d1903ca2 f9776a69 d63aed57 0c5159f4 de41b29d 48e3dc13 5ce35ac6 9157afe3 45c1e103 1d30c0e9 1f65ffd5 3709b440 d474e03c f2ebd15d 5a8330b2 eeae5486 2b2e48c9 dbb159a3 74dae5a0 3f29bef6 2f39201b 5c43a66a d5b6a082 563e92bc a11407df 82a2d817 ca9859b4 ccdc7bb3 cae33573 09563bbe e8bda185 7e9206a0 fcd0cf64 08aa3c54 f89723d0 07b6f8b5 d4ef5c14 af2fb957 7ed17fa4 d8fe462b e77ba940 bfe55376 48c92a23 f91018eb c3ddf784 25a64f0b 4b5fc4b7 b66438b4 4a5cc5b9 1052f9fc 9231d29e 40873dd1 fad72637 7edd27f0 9f700957 94810310 67581e9e 48e7c4ac 441706e5 22a904df bb66218f 3f213c1c b75066cc a732f41d 79f628b2 e796dfee 9cd3ca4d a087c52f f8a43af3 42b62868 2bd8da44 2668eaa0 29626d7f ba79b405 6f87b057 0827f79e c1869063 dfd5c395 d058b12a fdf901a0 1684dc46 ca23871b 6068e2cb 485475d6 7363577c 34eb732e e8114e58 eb7cd802 f1baf94d 5752743d 2bb8fb96 ddfa401c 147979d9 f4f462d5 761ad4dc 33da57f0 18433123 5b8b2647 11780671 82ff0ec2 78f75634 a3b53125 9ec0468e 223f4c75 93c4b803 c2b6ba2a e37328d1 5947c7d9 ff20000ca7 ff21000ca7 ff22000ca7 ff23000ca7 ff24000ca7 ff25000ca7 ff26000ca7 ff27000ca7 ff28000ca7 ff29000ca7 ff2a000ca7 ff2b000ca7 ff2c000ca7 ff2d000ca7 ff2e000ca7 ff2f000ca7 09816a9f b6de504b 93200aaa e5dc76f9 71c667dd 3620821b 63df5f05 6692c858 dedc8ae0 c5cb30c3 5f4f6f28 fedcb3ff 5afe7a07 cadc467c 73c8db4b fecc57a7 40b0b9bd 990eebbc 07c75503 319d0d4e efcbf90e 5ab0608c dfa16c6d 746d2e02 71724957 a90f04c9 74befcda 08223d44 6d210e9d dd18087c 7102bff0 41ffdec6 029f0f47 9f4437d2 d94dc16d a0c46418 1c8a78b9 a3a6a38b 4fca1b2b bf5c6977 64bce746 1ead050c 0cf99e8f 8d947f6a c78b49fa 5e8cda11 1d9714d5 308686ee 142acd8d 4c394eaa 3f4406fc 939d8ee5 545cddec 188e04b0 832dafd7 a1759805 61b55e68 c9d9f609 223e3c03 8430006a 2382444b 90ab0a65 050de40d 540173c1 104a1ab5 a47681e9 eb02764d 9a399718 fdb10d9c 99269f6c d5fa861a fbb94859 a4549351 b6718c8a 44580211 31b969fd 7d5e94f1 0ef67629 0d56f279 829a9f78 723980b5 d940f3ff d9054f8f fa750a5d ada7e19d c2d5901a 9196e374 63f49fce 807970dc 42f50af6 7e68688e 68dc7b24 fe14fcbc bb008298 cc9fc20a 7057cf4f 4dd0ce9e 8110985d 50696fc0 a11cadcb 4241dede 3e9d76ce c73eb516 df9eaba3 06849633 77586873 41cd8a31 9966fda0 50a1a937 82c05818 84c90ca6 9e168fa8 cbc631a8 c956cd61 0ef897e9 811b726e 448ffb52 3b3fff71 e3d7c821 0af19c86 8ce7585a f815deb4 78eda9ca 7b1b58eb 6a62e9dc efd9b057 35f0db4b a1e11120 b5817cef 8d028949 f6135d82 ae2b5b53 707d6c71 3ff1efb9 2e2cf281 da5c6461 5b269103 58452c9b 951bf073 600f0731 e5a40309 3b4d75ff 6887a74d 260b4ea1 398738c8 1cd975e7 3a6abab4 0d2a27fb 68bad75f 94014ecd 49149b92 c4bdc23a 7f56ff06 e8f53fcc 22477578 a5c2a77a 34ee2eec 55954e0a 95dbe8e1 e4134a47 86cffcc5 e375172b 6fc3f11c 4be6b996 5160b22e 01fe183d 97d179cb 4dac53ef bf1d1603 5c01ba53 1235fa70 4e3952fa 8060917b 2f65824f bb528a8e c08f8bb9 4419f93b 1c266162 d20f4222 24d402ff 5ce92901 571281e7 6096ed21 14a7bbb4 9fd4b9de dfd3f114 17606f6c 4d835e5f 09636852 f4391e45 fd00e3c2 dbdbe3c9 59e8de22 047f7971 3860939a bef375f5 3079d20b bbac7c98 91686e08 55dfc5cf bd1d298d 22febb90 8a17f12e 09a44c00 c1ecf0eb c3e7e1ed bf20ea86 f7ff95c8 0c79fc01 2d2e629c b546ff50 8f0417a0 3e5de93a 63614bd3 452a3e37 c0ff3d9e c4f835db 79dd92c8 5b5c8731 93095744 62052721 3dd0fb06 e8c2d04c 37b670ab 76ffb3ba 76b8d1e1 189cb526 8716422a c739132c 4d63c2e2 ef1f0e7e 36ad1dbb 71d3d3d8 c45350a4 74a05929 2017b4b5 8e51e159 24c6f3f2 eb7b7c10 7fc8e403 568fbc37 4ed8330f 8d760d66 de1f359e 3d897cfc 09266db3 01248b3e 5625c3e0 0498d713 0cbc4268 5e904be4 2343864c 48416862 330349c9 50d3ec00 e63fff88 5ae800df 509b0802 1d8bbd38 a5dccc14 6a2d8eae cae60649 e9943b7a 3598ca05 86d6fec4 914ce19f 0e6445ed e081499a d93893ad 6633d887 a73bfbdb ba9a4859 067afcda d0d95a56 29cb6f7b e29ea363 8dd36409 66bdffc6 26fcd11f 19dff37d c939a74f a492d150 2ff5684b 3eac08fb 7fbf33ff 6d841c61 2a0bd311 e80a76b1 1e6a8a8b e3d4a52a 4473adfa c2f362a4 43da8299 1f2d66cd daa377ef c483dcb1 e5e5ca84 6b46dfcc 529e6761 0095355e 4c78ff07 725e93a5 aeae2898 8a331ee3 6aa175b7 e529d914 41096bff 5e13ed70 0c40654c ec0389ee 3bbfdb7c daf21a85 9d2c9170 d45376dd 28198740 26391d00 9144a36f 1723c573 ccc1c0d6 63feb0e1 240af7ef 889852dc 369ef344 fa8b2373 4ce9f849 148e5e55 1cbd77c3 11a0bb8e d27fc9b0 1939e943 f3a735c8 5d98f97d 2660063a ca5b4091 91d3ac50 b2a0f6bb d00a4c0e b92efcbd f163e374 4fac657b d82868ec 638fd9de eb012f8f 5a1287df 189ea07e 9d1a1b44 2e143246 3e792a64 0e598c29 6287596e 9750f09a 564825f7 a5969e55 b2e9273e b9a7fd17 612aeea5 235f34b9 55dd05ad 65c39cae 2f19624d a3259711 1db410a7 33851c73 8c85038d 5205ba9a b6d11154 be930675 811a8fb0 8c8809af 93ec4967 ea81181d 6b89b1df 48abae5b d5161334 50273584 94a883e5 12e258d9 12eaf8fb 21564c54 b26edbc6 804f7893 5c1ada0e 9e6f908b d5946400 1a736755 6c301d25 1566d609 c36c9358 8c9c89ed 221703e8 7498434b 37e2b226 ee727b6d aaa4f678 8a5478ee c0fb74ab 1c4614a5 f26418b3 a2a61b53 d791e313 f53c13cf f3aa4230 549be5c9 58842a9d 8f7262ed 54af9cc5 819b50e7 d425b008 1a970afc b7e446a3 88b8b100 34cae448 7c2233bf 302354d4 488fa388 8ba4a335 39d2792e 44cf8871 be582b42 51f63e01 f968e893 0a4c621e 1833b55c 187bf582 70b8cf65 8497b73c 61df680a 12a73d68 e2f497be d4e78854 fc6d6959 001dda2f cc52c684 e4b1fbc0 bcaedaeb 418be15d 5ea38a45 5e320175 91ade159 3d2b4365 79f78b63 a7236e2e c5245555 3ffa042b 8744018e 51701ef2 a24607b3 77c53c22 1b794946 e2c54169 ceec01db 02b1b679 c8da07e4 503b1801 95a1f46c 4dfaa1a8 57d4df41 ca21f7e4 5d7e5c8d 5b5e4bfd 8bc6b9b9 4eabd201 2c710c64 60260dc1 8add9654 4c13cbb7 798e3b06 88ebbe1b ed63912e 83812286 88f7c578 2ca9d8c9 9c98e5db daeb4328 342c7607 375d9931 11b7673a 7e9e8c59 61593baf 95c20415 40381ad8 35552973 b7adcac6 7b05c0ac 4c3f7387 bd878778 324069b8 66466af7 012c4cf6 000d9506 259a3e7e 5e4724af e82ed1df 11124a00 5ff84fd7 a1e2d243 4c4c6dd6 4790ed3e 766be93f fc52d5a9 115f789c 5c40c504 b0713cce 52de20b2 59d25f21 cd797526 daf346c1 e32b37fa 10d48741 89b85409 d8d087b4 491591a4 e190607f 1c29753f 67989f7b 6468c59a 8f2142eb 6499d5e7 1713a121 751d8792 df7c3c8e 9b48b47e 00c52b18 8cc9cadf 6824da00 bfb25c63 dc0e106d 2c5b9829 758e53df 6018fcdf 79935271 174ba8bf a550a081 a282762e 6ff2bc65 410a10f4 13830321 7f04b218 4f1ab29b 2f3c9c98 7f5e6419 aa76de3d e74389a2 021198fe e15a948b 72931e0a a2119b15 4d16a29b b012af12 7674ad4f e15dfb70 aca08c4d 519f5e28 1922cbb2 36a7d93a 1f7ead90 5d69ce44 372d956e 39deb06d 3f8f6677 8b85be4f 406d90e0 21e611d4 1587b17e f25cd38e e8324ffa 0074e7fe 097c32d7 b28652a4 c7a63f56 265e8de6 4ca88563 845dd861 e4db00e8 96695780 23fdd6b9 f3c788e0 2129d66b 084eb1c8 feb0704c 12230781 738b9c1f 29aa017c df2d4ee0 60339444 2f294393 06fa7089 cdece893 1c469670 5943d29a d8153dd5 531c20c3 5d2ef569 b363a5d7 feb0765c bdcba171 a130a645 09ce3fd7 25e0469c c2b11c26 2cec1a1c f9a62667 ec7bfee8 16f46cfe 74650236 58fa21f1 2bfaa44e 038fad65 11c22ace 3b99674d 96e44d40 84b68306 4b7cef31 d18fc1ec 425e58e9 af7956ad 2ed3c9d9 db9a964b 09b3da15 6dae259d 583ca921 50fd2cd1 4f4f3356 8412640c 3680f266 898c04a3 c36d6378 2894f088 096d8b10 dcb25ec8 3c08eaa8 ff30000ca7 ff31000ca7 ff32000ca7 ff33000ca7 ff34000ca7 ff35000ca7 ff36000ca7 ff37000ca7 ff38000ca7 ff39000ca7 ff3a000ca7 ff3b000ca7 ff3c000ca7 ff3d000ca7 ff3e000ca7 ff3f000ca7 87e2377d cb65af5c 21af77e1 564fe3b8 12c7a2ee 2b163767 7e9c602b 618fd23d 32fcc75c 6abe8cd2 80419d3b f566ebf3 ed5b0a34 efe550b5 3f2c24c5 ede66726 99c66083 ce6ca4b0 3a53fe7f 6d520e8c 8a1fd6ed 97988961 fc05b232 1dbb196a 1d4cb902 e76d8d83 b9976e8e 9dd689b4 35490bbd 335b80b8 774deeac acb7a291 72b8ca5b 6c9711c2 4d6c78a6 4947fc19 d7935724 ae3da17c 27650d8b 66e23f71 bae2f826 190ffb2c 4492f4a4 08a9977d a514dbbf 1313e968 3d6470eb 47a39f2f 80c28c27 b8b92cff 9c69df88 8e86c6d3 036bbfe7 aa6e276b d6c91afe d703b349 e589a1d7 2eda2456 9e86337f e19f320c 8a50c4c8 8d551881 5b51d9f2 82c3a232 11ec0131 253468c6 b18bb16c c3dfe6a2 c697ff5e eef1d0c5 e8dfd0df b2f4fac7 27902129 749871d3 55a696c4 6f5c5aa9 053a8afe 9ceeaa1e 620c0648 cc837377 7904f791 01c8ca99 4abd8fca 8c44d923 77319d7f b3295991 103db3d4 bdf681ef 52b36028 b94d7ed5 cbb220cb fd798a7e 12f8b5fa c4b285d4 5a70cf00 e40da9d1 30a16bd6 e13267d4 b2d99fdd 3a8b96e4 a1761d01 b83015c8 85bc2214 52de7a3a c529be31 cbe3197c 78ad59a1 1ec7df4d 4aa186c2 20110004 4b5148f6 144639a1 c8e7ae11 33a1bd37 7243af83 a1b14167 361499c5 7be1863e bf0c79ed 7a090e59 a1a46011 ef2e6732 f401fa1d 89749742 d9ad1a8c 8b0f664f d7046fa7 ed062166 9ae47f6c 589e7bc3 afebb9fd a991e1de 71704225 d15ea406 55eca54f 9a5604de 70ecc14f cfd3ab35 7a828833 01a345b9 1ab4039d 10664bfa 84dcd509 e2c16ade bf3dbe56 a883552f d12b3c6e 0028c5d7 db965346 3a866c32 b8fbc3a9 a33685d6 36d37711 6aefb5c8 353df512 2e2f2863 4d3ee0e0 8eb3a4a6 93289c36 aa8d20bf a927c714 a8f34f38 41799443 3bae8f33 b5d34a4e 7a3beb05 18277609 d601e6f7 fa380753 23c69f67 780e8537 8985341e b5c7acc0 cbf9b460 fb5eef5c 3d37c1aa 634a697b 0f7e2cd8 414162e7 7db15822 867d6d04 29258ccf 3b29fcd8 a04531d8 981f1726 50408e3e 4470a3bb fc10ab1a 888992b1 73de329f baf78b1d a0085a64 84298e67 96f28fbc 57e009d9 682bd21b 0689791b 811e3232 3aa797d8 c042d872 3135661b 20bd606e f7c64615 43db3d7e 8cb89a94 54bbca72 26132b4e 5761f6ab e86a7eb4 b24f193b b9ab1a42 75ed9844 b6150f53 d1a1ddf1 e8de927d bbd50350 22d2d94e 9a29917f e11ab4b1 379a2aed c9f50239 a21a3f2c 97fdddb3 6f0db217 0929945f af42ad7d 57a524c5 7f7c9b27 c6937dc2 c226dfd0 9af6e4bd b3f29667 2544b2fd 8e94fbdc bf39ef54 992d2f8f 798ed24d 6d426070 a708a5b9 0faf2f2e 78661622 06d8cab9 b32cb156 1ed73e9e 972748f8 1699cd50 415eb3b0 62639622 08334439 fcb5729b 02d60d81 2f412832 7b71e4c5 a03d1977 d448d432 af35868c a4d30a6b b3225650 89bd49ff c36d7fde 672f73bd 8df29018 afa8cc2d a172690d 9dbd307f cf944ea7 7cc3c2fc 39a4e5b5 6b3c82ef 5411c7c0 4b044a61 e7333cf7 c3421466 07867312 c348c5f5 6eb65c9a 4dbf5764 4398f002 db3e6e25 9bdd7553 ba631d90 2b0cb401 e110b02c b351c505 fca30c2e 8b6b7a2c 345b247a ac801519 b3d1bc56 344ff197 5d7b9482 b04e7c64 c9b174d6 51fd1c40 352614e6 09a92a11 82695b7e afdcd2e6 8f24343c 26b99a3a 5a9dfcce 15b0790c a9571f1d 9bbf2f51 a680321f 41575d77 bee0eb1d f30d1833 99d84e22 6daba9bc 38a12b96 233ef974 f8b42c01 09fc370c 1d74b573 bd60fc20 11e8582e c9894435 3547d87f de113bdd 06e6f43d ef4657f8 06b21dc3 bf5b207e a485a836 3ad68861 3581c9e8 b16fe58c 9555d837 cea5e546 2752196a c4848ed4 811d895a 99a62d08 f0f92471 bc56210d 805da019 5e8a0f76 7cfc9e30 76206d77 a4bdfa50 cc1ab285 feb7a5ab e0c6875b f32107e2 49df7d69 31059dc8 534b3f0f b7f2596a 914db405 0782f6da 68670ece c209af86 12ff913f ea406357 6c667fc0 5415ba85 a088dae7 93f86b30 d94925d9 1bf13d3a 6c9b767a d295038f d8cccef0 d9a2bde3 6b8173f3 aee00b6d eb019d75 d8d83c60 ff0ea808 c6ba9b0c 63093ac6 4c356206 2e9e1313 5edd6681 f1e040a7 5e46bb09 60534498 62732d1f 846538c0 fe2a1c39 f34e82c0 d9e75cfa a911e49a 69072cfb d4f3f782 a0c9dca3 d12838d7 e1155e9e eb30bf63 8db02c2c 4d1a67bc 19b92197 1d86e1e1 3f937988 acfdc4c8 c1a9c579 a1eac097 03d13176 7d4e079d f7119809 0d4a5e0b 95b39866 d2b0cfc0 9d52f7e9 aa5581a8 72feeae7 9f8042d6 4d08d62e 3e11a218 b17d8819 1aacaedb e8c4070a 45df568a 01d5e950 2aead811 307dcc13 b0be4b48 f2f4b935 58973b1d ef90932c face9711 a7c312e8 6d01cd4b 68b2a871 833d14e1 bcbb7c68 680b0e59 4dfbe4f6 1152ef7a 3a74d168 de90b0fa 10b0044e 3e71b2d3 db8b9498 27facbb7 d3de7866 c9cf17ca 7e9b3a91 bfac4f9f 354feb6c 29984639 62568bcd 88d986c0 0fd22a40 7ae8994d 7884d89c 2a5ee0d7 a805775a cac26e28 53ce9c13 4256b84f 1ee707c3 e36e7998 d4f2fdf2 542c2500 d55dedae a8406e56 c8c21db6 873c6eb4 2f298b4b 23afec95 0123a43f 6a5b26a4 fa9a9f90 ba144170 4e66b6c5 114b54c1 b8e7847b 4875d50d 7c2dd282 a7fbdfd5 977009bb 5d8218f2 4edb5e9f f930c9f2 68aea669 28876e36 31d46a6d 2f5c0942 d994ab55 bc4eaeca 61eddb9e bb9b3112 420e6573 1f9ed21e 44bd6a70 8862b5b4 03c8e273 f8bf444c 890f9899 40a15c76 fa0114d8 2942e116 792e81d5 003fa1c8 66c88168 9f5dbbae 75a50609 9b4f77b2 76d9ec0c 252b50c5 635ec5f4 786461cc f0a8d24b 6ac44bfb d457bd41 92214b3e 226425aa 5f2787a5 ab668ea4 7ae5ef88 218fbb2f 28beeb55 881d4ee4 eb27efe3 37a4f59b 6fae0df5 6a6b482a 16844179 7b4d19e8 4ac39b24 66ac584e 29f89868 7f886c89 2ee9ceb8 3a5060e4 fdfb719b b84ae9f7 7889c55b dfa66902 0bf6841a c46926f8 587186c9 b60d5983 30f4ceba f0b5cfd0 13fc8b38 3be33fe0 de5d6891 f6e55092 95e836ce 277b454e 4b550bc7 a41ce7d2 c94b9fd6 800130e6 44f96b31 06037584 b3108295 a9af833e 94b971a4 6e9cd356 8ea77934 914bcae5 3ddb4ebe 8ee3bbb7 33d33b11 8f76d7ad 46ee0eb5 ccaaf074 9bdf3846 bb97027c 04f88b1e 1ef3ab26 78b6cf47 5f61b90f 9a7c41e6 29d7d465 31a4be0e 48ba29a3 e2c473eb f35e1d1e 1cb0c292 a4ec0f8f 2ca86247 1bcaeb57 0190416f a438237d c211d581 a392a75a e8a08d2e 63f82298 4c22cd76 ba6b5a83 39075c4b 5d5712b2 a9aa63ff b7b76f56 e56580f3 c42d45fc 4ba5185c 511b60aa 5df46f2b 8dddd499 2adf17e2 1d85bcac 9a43ae75 69f26fb6 ff40000ca7 ff41000ca7 ff42000ca7 ff43000ca7 ff44000ca7 ff45000ca7 ff46000ca7 ff47000ca7 ff48000ca7 ff49000ca7 ff4a000ca7 ff4b000ca7 ff4c000ca7 ff4d000ca7 ff4e000ca7 ff4f000ca7 e50dbe4a 2569ee95 0186ca2d 304aaf0d a15a4136 5725dee9 3568c8b0 16db3349 365c7ee2 18a9c8be 3aae5df0 9d1e8433 889c5166 3d3a68df 57bda1dc a75755d5 e2c391ec 12912890 f25ced5c 66efec46 a9e32fff 996c3007 835a9db4 63daf87a 9d657d5e e77dc793 e7b43d6a 64cf96a8 9f3dce94 17f2dcb8 ad9974ff d61b8b9f 5330b290 e3385e33 4a35364e b5adc43a 84f1bc6e 0f3468e0 3fbf1442 7b6f9a2a f59f01a5 2938a63f 637f7685 e2150e0a b804e3db a8c15230 3a16664c 01c4bbf7 d647a820 728addc5 c4b7519a fed827b8 497451df 2a0721f4 a159523e 036b29c6 f38c337b b50937de 5fd3d7a2 0acce449 afdb16a1 4855a7dd 667579dd 41ae1ecd cc3dce2e 7f21053b fef1fc45 17b7c492 f79de6f6 ec640807 f0d73376 d38831ec 65a2854f 50cfe936 ff018170 9d7c596b 2c16f150 4bbeb693 ef955e9b 0e61a119 12d7ca9b 9f949e35 050677ef aa5c9eca 59a758c9 d16aad63 31382cc7 0fd4bbc7 9601a31b deb5131e 03e42da6 3c1ec2ab 06fe92de f3c97759 837d970f c404632d e266ca0e 1409e4a6 ad6e9bac 68a370c6 addf3110 7e66637a 74d935ce 199a9a44 099f02ea bc1ba1e9 09ad3b49 7d117609 31596ff2 0a0f327d 3aa0bb7a f336ab49 31cfa3cc 3064c13e 281ce1f5 6de85c24 f6cb21fc b4f0f0c0 acb6ae9a fee5edc0 0a50f3c5 e6df502d 91e9f680 010f70fc 832fde3e 3ec43060 8c057cdd 9ff68fa6 c70ec646 6a994836 2961bce6 281ca724 24de25bf d13c1377 d1073b18 e0122b4a e3d23767 8ce1aada 80b41e56 3b8007ab 6327b049 218fc4e8 e4b3cb5f 55bc366a 2a3a4e9e da7f0c0c 196a64ca cf88d2b2 121cf042 51824a99 28e53370 010e4b3a 2f7f5a97 830688a5 43c79a7e b9d93f8d 9ff94387 afbe818c 2e7f27f9 aa025b75 466bc0cb 014c9477 534ab7c3 252d3a9b ee82ed4d 5911fb04 36bfebb7 b63f3350 4d93e5ba 3c4f7d9a 806237a9 1bf89bd1 40186953 83e3605a 1db5b307 d73f4246 ceb1c6e7 b6f84eb3 7528acbf b953402c 89a659ab 943808ea f0202dbd 86bb1d0d f6741e57 39a57484 5d0c6e61 810b83cd 5d375072 dcfb8983 a00dd797 816eb855 584466b1 46bda0c7 a3799936 035cf5ee faf49376 79467206 5a06315e 3261dc2e 3264c515 fd722eea 6b2b15ba d84df519 b4e9cd7d 013c54a3 2e8574ae 226cd09c 587a00e6 5951a6f7 18ef3806 fea4df09 29ff5486 b5828a7d 14978915 7baef543 7f014b6f 511c27e0 b288ce18 0e4dd4d3 91f5e098 d16effac b20421b3 b6d35bbe 4fe114e1 78780efb 39314707 823cb955 bf2bdb02 fc0906c5 cb689a4c 29f2da84 6e72db6a 96f420e4 8acd1da4 d951d4a7 455e38d8 e785135a 2202b238 daf71009 fa403ff6 422d564e 5196cc17 1b19cb2b 4156eb29 8565f0ab 168fcefe 32672252 4a5d8961 bcac4ede a6a4b09a 5e11f359 7fc04493 7f509543 796f0e9c a77b4205 665671db c0db757a 77accf2a 6ba86805 4ffaeb6d 54f668f4 91e06dd9 aaeec806 d5dd860c 1a226254 0647fd8b b07330ed 3681d74c c9453d9a d7edd23a 688b05ea 2cfe579f c8ca4dfc 628ccf43 f2aeeb44 fa365574 00327f3b 7cdf97bf b252a711 1ae576ae bfdccfb4 4bf620cd 2ba056f6 f07296eb 1f682bcd 2e4b11b1 e86da6a5 c0d0c14a edd0bb9c e147dc4f 33090dcf b3b58d5c 7b7cd874 d902fd33 b77940b7 5077e78a 0b481ca4 9628f9e2 00020886 a0902a05 838e8ea0 217dd764 0723fe2a 012fe5bc 04b64ef1 0036cffb 0a45367e 7c423112 53923b59 4a03d382 54981048 55d51f14 aa610395 c7297826 9ead538c ab044f4e d4583590 927d3aaf e25d14d6 f9108d57 4d1765fa ac5567e0 64bf7d82 9d5be1c4 3a788301 86ca38ed a6ff70d8 e55d7841 a21131d6 be036669 da2273d4 137b5171 4e2629b3 118d143e ff0eff87 33a2d569 4b93230f b2f1b45e 6c8a1a70 4068f9a2 d9d78bc8 6df5d5d0 b2a8f8b0 d29c587c d87e2f13 b2864352 972701c8 9551e50f 4abef5b1 c16aaf7e 9d9fa11b c216b53a b39c25f1 d63e6f4e 2e846bed 4c224750 92d9c36b 9ec41fef 835e57e1 4195fbe2 16cb6b23 7bf079a9 a7acc309 38c89fc8 671fd017 e13710e1 c57ad0f3 6d0e7729 173e79fe c719fa46 1e15e0cf e737bad1 f51d43de ea68e1b6 cbd0663d 26c34081 f810c792 ea664976 19a6d318 932e1dca fa55261c 6b90faa6 4b70b86f 5121a672 f9460467 e5111b91 bab691c4 0e90e0ed 8f883f67 f96e7673 33b8b0e6 1f009506 b0b5c9a3 2c384268 5610a435 c08a643e 655b77a1 ab1bf838 bf1b35fe d44945c7 13c13374 26df7b76 6d848d0e 11e920f5 d341a460 c707ad73 89bda8c2 6fe25eee e8d0ae25 0dcd6566 f6930677 36459bc7 83e36044 226c1e27 61f64b6b 742c04ed b5eaa853 e192c837 0578ed7f 295e564f 8b4b3692 cfa546ad 31161d33 e5384a43 023309d6 4f27b53e 14c26306 5495962d 19a1c20d 10f445b2 bee967b0 49a715a9 04ad3df7 224d12b0 c966018c 4bb735c0 6716ef2d 07b77846 be66a758 5353af55 acc21d49 90eb2148 ab420e54 559dcf3d 6d2f8a82 88c595b5 0e68ed29 20a68774 11419b00 37824ca7 7f5106b0 c721d233 7791c468 fb5a5cb9 b23bc74a e394057f c2be6a59 c7049a02 71856dad 7c5074dc 8a5bcb0c aa02c4f7 9b158740 80ab92b0 bc7a8d77 99a4f264 7f580bf6 a27585c6 681c41de 637596fe fe77e7fe 7dc0f433 198307d7 5e383db5 349ea59f ecbded3f c6e4d2a1 432d6cd3 8d0e7ea0 8f62784a 92ab5169 d89d6733 cfbd0447 b88a6f94 41eeaf1b 35d6cc53 9702c600 3c8d6aa9 b523765f 16b90150 7b083972 235c3abf a17f8c77 c81231aa 349f9eda ff50000ca7 ff51000ca7 ff52000ca7 ff53000ca7 ff54000ca7 ff55000ca7 ff56000ca7 ff57000ca7 ff58000ca7 ff59000ca7 ff5a000ca7 ff5b000ca7 ff5c000ca7 ff5d000ca7 ff5e000ca7 ff5f000ca7 0e9c49d3 c0461e6f 2916612b 40c9b1b7 5bf4da98 1bddc481 6e5bf520 1309e6cc 321837dd 884ecd34 5baf03a3 3fa957d7 f2007351 84750c89 629a6324 f5b80140 af49047d 1c1388da aeb0d8b9 131d02ae 6060dfec 73e28cbd 3220041d 5cb6b6f5 d3248dc5 d4d69294 ac036059 e42a23e1 c3c8fee9 bb8134ef 328eff6b 19e9ff8e 4ce12eb5 286ab7e9 94323f35 914aa423 ff1aed17 845d65da 6ffa9d5a 6076cd56 f87992fa b7506454 91080263 7c2a7c41 2b422a2f b6e60d8d 1da57170 46cc307c 7091d303 29024144 8c0cc4d9 e35ea90b 6b133622 640ba327 c72cf64a 7a7788ef e079666c c512db91 22dabaa8 747dca20 03f0cd34 068f1e7a a4921dfc ee3c0815 bb38539d b3790c0c e7e090b1 8fac87a9 21aaca2c 4e5ed30c 4c37cb13 cef06c30 2b2fa345 dda9e729 ae445606 4e4b7619 bebc5c30 1f146c7c ac37dc91 229edc5e 44412c3e ed7f4ce0 ef89cc7d 16bf5253 cd46aee6 a8854afc 6ece3572 b3297511 65d425e9 0be19a70 efb9ba98 07fe4ec5 b272fb57 dc1e5c02 5631472e 374c4dd7 ec4725da 8c042079 f2e62588 e49875f9 0e9140cd 179bf020 a215fcfd 3ba8b8a3 a37e447e a4e6cba1 ac482b27 24bf2e9a 74b973c9 01dc9a71 645b0920 9af81530 aa0d2c65 c9f5b29b 727457f0 9ceec06c 6fce3981 fde7e702 a95fe01d 6424072e 679c1e80 5659ad9e e0ece859 5790f28a 81f091c4 6bfa6704 3f8542a6 ff438b15 ac3e422f 589ed9e4 7d661808 ab955316 43230f63 09a27858 e643b2eb 6c010562 23bd1478 228940b5 b261ac29 9a0c3ea4 5a21329a 950d4c05 e930fa19 e47ce40c ed6d99e6 b3b80fbd 3b0cf29b 65f536a3 1cf4e9a0 04e0c51e e48f3ce6 77f35b1b 4de1c36d 4740ae0a 41e4f324 fbc4491a 207de0be 05628a86 801860f8 cd06a2e4 0e0168d6 a8a5f889 2299abf4 3ef3f829 5a97ccd6 bd0a5dd3 fe29721e ccdfa8f3 27fdae83 22a1c633 4a0eda8f ecb78d69 b1ae5b89 b9c9ae2e a573461d 6ec8e230 31ba363f 162034d9 b2c90b60 de29071c 9d1f5c75 288acb80 412a7aa4 c749ac48 4dbba9a2 a09a835a 426a43fc 961f9748 66c66bb5 9876b61a fc825db7 d22901b1 e3e8e195 a2dd3496 a384b016 cac00eba 26a3950f 0cf4fb84 bce494b2 ec8eca10 537e808e 4eeb9060 bf2e9ffc ababa0ab 231d6c5f 3baa09a0 7d2b0075 e789084c 05f517c7 3f7dfa10 191f12cb 02465dc2 dba0dfe6 c7efefc4 379708ed 06382670 89bd3505 b2668516 0ca86e3c 227f73f2 3ae9cec0 e3e95882 2332b318 adbe0d23 d1fe38d7 5911ff27 2f3eaebf b3ca161e 3e5a7f38 f113318a 77e89252 004f5036 4db67883 2c73ccbc 87537aa9 3449035d 2b38a960 a2abb4b9 1c7bded5 02ca7706 39349714 f61a5a93 647aa900 6d06acd3 d189076c 5f3306d5 6eb4ff75 0bdbcb52 edb37409 efe695dc 92afbcaf 3cc9d941 074513c3 ef3b0231 e7e1b544 3ab8e84f 03e045c3 bb4da657 35a5ad67 44134da3 cd7c0ec1 e0d566ac 018e709e ce9c4bb8 aa863fe2 6c63718b 12607c79 426bccf4 a01615f8 4e9b45f0 da6cbe5e 0e02146e 72ef62f9 f52c1132 73cc5a38 8da215c7 9c68addd c8a60c33 e9d579d4 cca4dbc8 00967e0b 2c7fe451 e2288217 10eecb2f ea57ac43 bae6899d 7663c179 b44f1cea ba47d6a9 b213067f 2ce51744 152859a4 041a1b2d 6671b063 9a457536 29b4008e c8f0dcd6 28ced31b dff13576 233d87b1 f5566552 66c41b42 1ea39a91 883a0f1f 6f0727c7 ec76d4b5 e07a1ab8 698fc6aa c343951f fa0ddb8d b3acd514 fa56e916 c4cb697c e0305e85 65a185e6 6889226a 8be18c37 4fac796c 7c5d47ca cb3aeee4 cd3afb05 137eddc5 df68c513 b335667e d31abf2b aff698ee ae0aa209 b33926fe a0eced41 98412363 ff6aab3f 35708c70 96132ccc ffd74a4e 9e8d1f36 c69fbde9 3c195b02 7d3e8dea 83684bb6 21b62f68 c5177bef 6f5be452 6fa25354 fe5b6239 f3a4d358 c7427f40 03086713 6546b55a 1a54c20e 181098b2 47666dc8 be87800d 97360009 586667b6 1f3417ac 46ab1b34 10d89807 926a339c c3a47f1b 479aebec 78ebe2a5 5abaf4f9 b9235950 b09d98a1 4771306f b0efa199 b4a33ad3 e7cc9df4 73d94a11 c93a7c9c 2eee0995 7ca21f97 29556100 f6b01a79 1a4c258d f924822b b15de7fc eee18616 7c750ec4 2f98acbf a08de3ed e9ff84ac 41827b84 621555e4 8ae46808 32e831e4 086d4d31 4110970f 36816c30 cd58228c 8569401f 9498e786 e9f2b630 c32be318 8838b702 5ca38bb9 ab47951f f0042d4b fcd7835e 1e0beadd a701925d 7d3e023f 907ebd4c b08a7be2 78f6e976 58a30fa8 e314af66 3663a065 6349366f 9bbf48ea 331461b1 831aa311 f8d1d0f3 a2df0758 ced320c0 12d6c866 f743442b f3473ea0 d6a6ccbf b6fcbfdf c9e361ba cddd93d2 028e9c51 258e4b4f f6d7c1c4 125717b9 4c4615ef ff04c1c0 0fbc3795 40b57c4b ecb2e6ef 400d7cca 2bb41491 84a065aa 95f15dc5 9d7eaf44 21ba1290 86fd8686 7c3e704d 5f507b1d 1f18aee5 20e635ab 8bad1ccc 9b5296bb 54cab2d7 12ade188 b00cc8d0 774e9882 10030f39 c0294c57 332968c6 7f4be1a8 e65fc440 b24bb6ef 219c3451 329a0e06 ed813271 8185e6eb 2ac206fa 494266a7 9295e0bc a67d1767 8716a832 524bde73 7a952a7a a9690751 7a1e4d87 f4416497 73786b84 6778fa45 9c3d06d7 85f145fe ff468aff 4b845e3e b98f6fb9 36f79f92 36e43263 128d39d2 8ca0bb4d a21ef64a e1241188 71bd708b 897898a8 8c305c9a f925898a ddc647c5 651ff65b 3e2ce3a7 18909b48 8253dc4f 272fc909 b7076579 ed098158 f3dee96d bf592068 7c9ba3a2 bbef1eaa 06861286 fad7bf1f dec21d02 2a2f933d 08eac978 8203c47a 2179d56a 41eca026 2805b84c 650a64b6 2c2bbafe 0163dfe5 ddaf3606 47915292 ee5e2ddc 93f4d1d0 5fb6998e decca4f8 dd613231 45b9f699 6af67f58 317b2771 ae2bc2df 9944c2a8 104925a5 7bc6c986 702abd36 fac90317 eadadd01 0a643572 2cf6d007 b57eb3cd 5428740b 2edf0de0 754ace88 4e9cb97c 022eac91 fe2c97a4 853f6906 fea1517f 08578854 aef60539 9c088962 28f1b0f6 510c17e9 d8e8a9c4 b635e057 db286a23 e8e5cf8f fafd8a98 ceae239f 77054324 bf418bfa 43d02cd5 670abba1 165db135 bcbef010 416d0219 d97c014a 245a26d5 f0174db5 11894179 7b04274c 6a94a36f e9e4f8a6 2b0d715f ca8c9abb 448a0eee 5ecd0c8a 1cf450da b15e10ff 8275cc0b db518806 c8d472a4 04f3de6c 5d0ae895 55173ba0 09c243e2 1a1f9852 5a1850c4 41f4e727 42fd3d73 2a2a51d2 68d519d4 0cd25867 075d737f 6f031ab3 881935d2 61cb44cc 2f9767de 9b1187d9 dd9ae499 0a341147 e4dd8e87 fc36b72a f155e1ac 2de68a7f 0aff7025 5db991d9 685e757b 96aaaa66 76a4d555 b6a7e257 49269301 02c759e0 e5337132 6f9357d6 9575ee24 a47c1dc2 92f68a46 f3bcda06 6a2bacaa faa913bf 2dbca41d 15ba2e86 03724d4f fa038f51 82a2a505 a27b6924 8636cd8a b75bec96 43d90735 2681501b bc73bf6b 4237e1ae 4e3e0e3d 4c94c2e6 76589308 86f426d9 f792d79a 68d9a097 706a0b96 3ae09231 1503a8d2 07fa1930 b4b12f00 bd7186ba a74caec8 d0bc379e a5eabe75 2f1b0e30 748a5885 c5d73dc8 2d15613d 3bab6210 43fa2dd0 718b9680 c6c03cac 8263d3a7 4318433e b80648da 72ad9466 6e2eed45 fd08720f a8f0059b cc33a229 d7842944 a136e945 ee9cf17f 5627e867 7d264070 074427c7 838da031 e33d0004 1301f1b4 b744d36a 82730e0e e3349617 d3b18145 65826222 3151d1c8 96e7101d 94abe8e1 b38dcd0e 25c9a566 014170cd 950e6de3 8dd5efa7 9d7e0852 a53878bb 2beebf27 0149449a a40830c4 4cfba732 c26a63f0 37400c1f 3b36fe75 8d6597e4 f20d3e4f a742d321 43e12148 2baf772e db14e94b 9822b9ae c84add8e 5ddfd52b d9801ca2 7b7ac8a1 7c86fa3e 894a439e 76e1a3a3 3527352c cf3d64c9 c0b99e3d 15943132 5e2e103d 35db7991 6d8adf1a 0d7a138e 8ca800a4 f07ea6ac b757720a fa38270e 6fce004b bebde0a6 70fb48da 7d855ce0 0f0fb5cb 6ed59b1f 8c5b64e8 fc454594 48ff51ac fa3d937d 2ec62c83 2d950766 e9932518 713d42e3 a489c1f8 34de48df b0fe77aa d539808e 3163852a c74a512b b6bbc60e 22f2d101 4725f9ef 99dd6ec7 9c23011d a3aaea78 3bcd9015 76a5129b 3744b6aa 439168be da323c10 5a5d1263 eb04b1d3 cbb0609c 59ff55a7 25819df3 29c51b7d a4271fb9 a978539b 2373403e fd1c3c9b 6e5f3caf cfaca09b 226e4532 70d150fa ca79c064 7c10aff7 e1ee546c 5f1fcc7c 16d3d283 0bddd937 4c9b1ac9 d8d60772 1fc8e5ee b41fb840 94799613 19fa806f 2c8f7885 012b8a3d 8cefa565 f748f30b fcbd430b 3a70eeb7 c69e0769 683b7b95 f39ed006 31b6a75c 493ab942 b97a9a6b e845aec8 3681e429 c1c4c0ab 72f4e698 0198bc85 37aad1d4 2367fe38 f088b902 ed0b4573 0aa95bf1 c2d43629 7e0998d1 5f739ff6 ad01d554 48fb1e49 74c5c637 b732d7f5 3376888c 5b733bd6 a2c28072 cbda844e 35a926e7 6e63ab46 4414f628 cb80703d 36eac256 c173a45e aab61a75 9e0553bc c9c2cbf3 ba09dc05 2535f4f4 59d8703a 9c5bf51c 5530ba99 6ac80135 50c382aa 3c559ca3 f97ed7e2 b540be18 a6db3c18 7edcf3e3 c09bb5ce 809b12b6 158e26ae 9110e864 313d7716 92571740 e044287e b6ee9908 a2ecce0e b16cd8e3 4a058d47 5bc08fbe 7214745a f8b108d5 da89451e bb5e50a2 8b84d921 65f24225 ae5a2e26 e0386c59 ec8d992f 9b238759 cf95c1df 47ec06a7 bc6a11ce 4fcf9c2d befc3271 676c4285 ead09862 16821cd3 af4146ba cc4169d6 ff095ea1 6ef4fc8e 9916fb03 41c580e5 d27efb03 2e8b0b6e 6ec6390c 53311043 30b61704 c50c4717 667948b4 6fdd14c0 05403861 3d49ef21 f72a9caf 8ab67a1b 8560d374 15e06e32 98ffdd42 de8e7393 4528b972 38864e8f 555484c8 d5843bdc 0ecdd953 fca781aa 41d034e5 576b42e4 de0e4364 419bc301 577f0f43 c1f79d14 85ae9628 bf5bc124 02fe696d 58bd2593 2405bfda bf8a1ffd 1cc1ba6b 8f3d3b8c a6878926 476a6a3f ea9ea675 a612f7f3 a965adc3 287cc431 78b3dd1d c1a6fb2f 761101ac a8cc17bb 8b844e7f 5a4dc2b5 2d9dc2f9 f3aa1826 47ee9c1b ae16e6ae 4ef16c31 3153a751 109e22a3 ac5d16a1 0cac2c19 25cc0200 73a1658e 036b89b0 88db440d b12a50a1 5537477c 1b4adeab 1ae03f4c 0f0acd50 a4b8a772 a206cd7b d73f7faa 3d6370fb 3e8824a9 6512a1be f06d1a4f 0c2c0be7 fbaa4276 1fa4736c 232d4afd 4316e1e6 83057c73 49b12d0d 2731039e cfa35d3b cdb1d3c3 b1bc50d5 f5399a18 8b9e0d39 87734f7b e35cc026 8eecc314 db5819c8 bd7751c9 fb1f54a4 dab3fa41 a00819c3 ee926fe6 85c57b6b f6e1db06 04dbb051 59a62d4e a7c309ac b6ac23cd a7491693 a5f095f9 31783d4f 5e7f57ee 952f2f17 0059d41b e0f97b09 e2a6645a 1e3e3ba2 387f4372 f703090a 3e26d92a 05cfb49a 3e5b17c5 251c327d f6300a0d df079e1e 7de09cda 66896e16 409fb3bc 02cd5d58 d20aa8a8 6bff580e 4524aec2 709c68f8 db94f0f6 f8c3601f 0c571ad7 df77a7fb c73845d2 06a4d73c c5779836 8df94d2c a28fa3bd 9eeffcab feab7e47 5990555b 4d7df4bc 9e930858 3e2f22aa 1e74f78e 911f9009 54c01d69 306df1eb 971680d7 7b33dd20 7b53a1c8 5011454d 08515d76 b4b1b048 15dbd097 cac7b61a d8910302 a1e42c36 e7353a32 5c304211 16aea3f8 0032f3c0 1f0b9116 9c4e1ae1 fdd33ab9 aa810f84 d330a3ed 12fe57bc 354ff9a2 ba0089b5 2d4dcd0f 7ff1e4e3 8db03e5e 3323bf2b c13641d4 18eea687 12236091 29c848b6 5265506e 9539d983 9e6f2725 9acc4b68 cbc9f2b4 c6be2109 ef9a6325 0118d4dd b7ab3d07 43077565 8423818e ef1339e6 463240ef 9dea88c0 971a5905 e45ce2df 7d78486a 8ba8c4ec 8ad923b0 a95fb604 5022861f 236c37ff 3fd5c2bc 92c04b38 abebf43e 13f9c962 248b9ef2 f1ff1468 b4d36e01 30c27ab2 cbee25f8 f9b5d7b8 32d579af 3fc7ff0e df24a017 daadc614 a1b7a00e f4e7ce76 9c8d7dbc c8518aa2 5f5956a4 259fbe4b 17112eda ae383ad7 18daa077 fbe90ba3 e9270e00 3f86be16 4fab8cd3 93a95dcd b2f1d689 4c5a5a5a 3594e344 b514715a 88e756db 51b1bb5f 23e810cd 91e0a4ee 4dfab94a 2bbf2b5a de072512 376622d1 63887ca2 a2ea1a73 112afce2 2b9087ce 65fb937f f5eac480 1602dadd 5418869e 4bc0717a 40feb7fc 26705b0c ee2da5fe 5f1da0dd 26e91173 86b019aa fa15b894 ba6ea5c3 55d5ac56 d6115327 03f31bd6 cdb51399 5a4cfdee 8dfc39d8 c775afb8 bae30eb1 8c671c60 53832d09 e4b0160d ac85ad9b 82c3ea92 0076ea06 b63535f7 e5c41ea1 7dc7b205 bf69a9c7 cb5d2851 e9451751 79bfc05b 8ccdff68 180c32db b30cc96f 5b80b92f dc6ae9cd 5e19d88c 798bec56 7cfde068 e9343ca9 220be4ac b7b734b3 ca4d58e5 cd2eb84a fd1f7a6d 6228213b 25f0e81f 0017a67a 2fb4c8ea eae34ed5 c2a74d22 ce967381 f3e56af6 1392e010 7d0ea6c3 1e6b1ed4 ffccff81 ef5ee242 798dee3d 4bf365ed 7b0cf407 78b3d2e9 53cd49a8 516dac05 5151679b f07a1cc9 102b78d1 b2525b6d 8ab519af 6e4b7684 dd64a8a6 428e46f0 872d0852 7e9c0f0f 5d80c0e5 521dbe89 54871e45 80db938e 46affd02 5b70319b 5a9786c7 72b08ae4 c2f6c97f 3e2a745d 987b043b d60f5bda cacc2d8d a299ebc7 52a7723c 179645ee efa8f2a2 5bae52a8 a3d94356 23890a81 127847dd ba9d7851 f40ab406 e126602e f70446f2 8ca83d10 4e305b33 d738a77c 09603b3e d556aab4 9a58853d 9868318a 2d657c88 6d2cce6e 777c31ac 40a09d10 5ecee999 62780668 b9726315 bed039dc e1face33 a47db947 76f2d90e fadeb63b c6047269 8ee33447 00eda861 f3ef11ff d972e9b1 cd58ce80 0fe02361 c298cf7d 5a04ee99 5e0f8669 bcafa6cb f3954d7b ca1863c2 28e900fa 1ed22be8 7f339acb 8ca321a6 ee23eb30 92d9fd59 b4f8d76a 6bd0e7ee 995d16d9 faaf0725 c6d92d28 9626690f a5717490 f0017f47 8d87c640 37fef822 0799f185 95969eff 3764a06d b2d53208 2f000036 8c384c4f f863c739 fc6020fe 59aeda05 1250c7d3 c31430b2 be4d4c1f d495f89c 69749d74 a5a15c5d d8ed4234 8a75a08a cd4d9ceb fdbad020 86e1a97f e3f0523c af95c2a9 c5d288ff 215decb8 08a36633 305f358a 2a2e4a7d 3faa99a0 0fd7a9e8 3a92df65 39fac516 3746c932 9d5f413e 8ac56d74 a2946e2f 21be60c1 0aaf6454 2a137ea1 b4571dd2 7674552d ab92b9b4 c00c87ea 66644888 decadcdb 05320b9d 35f8d3e5 8f7ade13 cefab140 b60a82e7 1ca83f71 ab5904f0 90cfeb1d 8bbf91c3 929ebc07 1216b6bf fc2c616f 4e4dc88d 0959ae1c 1dcb2caf b81aef90 fb6cd285 5e939897 223eeb4a 658afe57 ec2462c1 633b0f47 b05055eb e3c26206 607fd37a a067b32a 0f200eaf 274faa7d 6c846ac3 b7dd6324 1fe5cd64 e4815d9e 30fb6a77 828548cd 59c4aec0 4d6cb04b 21b0505c 24a7369a 64b9c606 831c925a 9c09815d d5302a17 b985cc98 99722481 d5d8eadb 86a691e3 3fad1adb dd9469af 618eab38 3d0ee215 05642e64 b34915f3 b02642d9 77e6493d 6f2e2998 ec8a74d9 af119b85 da6ee9d6 c48955ff 8081f9d1 b3cee01a 4cb9413b 91d495d4 b69ad46d 5ef4be73 995e17f5 38c2fed7 e650f752 3fe2bbd3 62b2febe 9c439381 a5ed333d bf4021ef 401d6373 6be59292 7183ff7a cf601b77 0b044d45 841349cb 76ea8f2b 34bb29f0 5c201a20 506402d8 17d89dca 2b5b918d 79a4d4d2 39312034 b138d68b 964f189a b2b4c519 adb81b73 3d6bae75 a2c57b55 7a103169 6b86766b 1bf43e82 af97ad9a dde58e97 a02adfab 62c2782b 4760c79f 1cf3f31c 94a1c947 9fa43f3d 71fe6b51 0054217f d0261ba8 63cd2210 e45662bb ed21b1fb 2b9931a9 9dcce5ce 180faf53 0036d84d d08dc32f c2d5dfd9 9680377b 50ee7ada 5d0f4900 6cd65a1f 281ec595 d6f560b6 fe60fb47 e9896cef dd0ceffa e3f1591a ad6bb45d 5b1b4957 185f6959 5693efd4 ca546c40 0f93e233 c38b1441 82eda206 aa3380d3 672aa75e 65ebc996 825f96e1 ed27e54a 819640c3 d1efec35 e29fe0a2 c4a2a786 1078e46a 8d3117d4 1cb4a11d bd0c52f5 ef18af6b 36bf73db feea76ac ba020019 77a5cadc 5075457e 7fc24433 724fd9cb 897df3f8 4d2a1bc9 07934f5c 82a1e026 02148ade 634a3145 95a7dd37 048ef0e6 e984e805 52fb80f1 28f5ffbd 7a03751d c9d4f616 a1c74211 198fc709 72e07b5b ce979e12 e95aa412 5fc644e5 713762fe bd3d3a65 b258d173 2edb5e8d 885f09f8 ed4a594f 770f79af 92b1b95d b02bd855 c06a6189 541d7468 40b56715 928a51a7 d63be2ab 6fec010b 6417a141 6b49d48b 8f9f6c5a 83703025 8577eee5 5a2b68f4 d2391e99 3632f03b d298fc64 7064c2b1 ee37a970 8c24d47c c786069a be5fba41 3fb0d49c 5ab1053d 3692b1cb b8d85ff7 e7b6dcaf 0c55deb9 5c46ee36 3ea1cfab 02cc1ecc d13c56fb e4ba3412 513e3405 68c89198 7036dd46 d7af6e53 34743f55 d95b6b66 63b93231 9b3f695f 459a7fb0 c40b804e 9bcb25c4 4392f314 1c358f39 72bf623d 4fd6af4f ff1cfc56 807bda60 14dd877d 4bd8cabb ba899ef0 b39ba96f 17a7b16a 08d4ecd0 4f3d95e2 1b8b8d42 f4123b70 6196eb28 7b8bcd11 187f69b2 2baa7a14 23f60499 e895ce4d 549a823e 41d022d5 72fbacd8 038f5146 ed61bcbf b0d1aca3 8a32b78c da906c1b 7394714f 1162bea8 b70df04b e1b7aa62 b99efe81 cf22d20c 348142bf d19bfba4 1f270ca3 aef93492 4c055c3e 0130ebee 6c19c2c6 19584c65 a7f31b26 25082c56 56660c78 66470ab1 a5ef529a 9b6029bc 1440e38f 14d75da5 f29b84d4 8f592053 a216e3dc c77a8648 ac1d3cf6 cbf45b31 0fdaccf4 eacf9427 ba07f001 d15c56f1 07c4a264 ed21217c 0ed46e6f e1197a15 5c9ab9c1 0b5feb6c 4f677622 633915e2 93c708b1 427734c2 37405375 9cc6d214 c853d3e9 59d5714c 1a649aa5 4216df9e 59181993 09a71367 73127319 4510cf8e 9a3f36fc 2e9df0c4 ec5f86b0 e84ec93c 2a2bc73d c5f09084 e1d4968d d0adc51a 4ec4ac17 5d07ddc5 cafe7b3b b8b0df6e 6292b83d 3978f923 e93dd87e fe829b09 2dbd5a13 4cc70785 45593b2c a362d408 59d6ee4c 76476dea b5751824 8887feac a6e157c1 72e6d59a efa16af9 9eefadba 3de99340 d2e58050 e8b3e7dd 3b90c07b 97c7f333 e00b368f 13c22543 1df24f2f 827e2f2c e64ac2e1 04b39085 013812c8 27f96a30 34937f87 445687bd a5943166 bac5acb1 7a53f69d d1b0494f d962cbe4 a9b5f3d7 7c4d3ab4 1da9aed0 8abc96e8 c57ad478 c64df926 5024c4a5 913c6d8c 8ff6df62 54a128cd b8eef2cd 7840d570 396bb271 993ee18b 631f939d 1508761d ecdd710a 345d3ff0 35d3e2c1 60e801cc ab87b627 2b2e537c 1b3cdec0 046df391 1aada4ad 36a18f85 9e1f8a60 2a203e95 b15c7ed4 de3b84c3 f946abc3 bd81c460 af3d16f2 1de68f3a 7eb7483e 3a945124 8a0a2ecb ca4947cb 1e8007d7 b42b3710 54a74268 97b5b460 16514575 5b201fe8 652bbdef 1498c03c 455b8ce6 e82280b3 ef728980 516d963d 8c726d71 27a14dc8 cdb1154d 7e5c91f3 44d2fef5 1a674991 af60b12b fb071860 8a8f001f 9739ba76 e1250f0d c8c8d2fd 5d05a471 08c57cd7 7c913198 dc3da9b2 98b6bdc1 7a58b21b 6ae6d361 76373bb7 76c382bd e7d7a1ae 70614785 7211eec6 eb5f4e72 cb0c5fc5 12273107 86237850 958581ee ee4168a7 9fa8c07a e1e50feb 51683513 f42b6f29 cd3ed699 ef67a0c9 2ae00adb 2c56ad40 8cd5e73d 1ba4f83b fe38eb2f e5474ecc 619aba9f 902a6432 310e3908 73069ffd 3f898f75 b4477b14 da0866ef efd1ffe4 506fb86a dc7c95e3 261ed420 dda8c01f c48f7435 8d10f9c0 ec2b3128 6b002e8a 71f9b005 dc7de7f6 764fde1f 814533d5 44c95dd0 a5d50f09 13194faa 62c967e1 4ec476db 79eb4f92 3203016b 027eaf8f f1ec43a9 8ea62789 5fd9125a 8cfd121f f5e3892a 8fdcb18a c4e680e9 72c3c61c 17cb28af 883e6834 eeab3471 32eb9f2c fc7338c0 a41db8cc ef369012 0dd15131 fcfd0622 707dada4 288c949d bdab4727 b1c020a8 8043ae49 8b5b97b5 797d6b30 08b03479 ad9109f1 db3e69f5 1c925e3d 429674fd 4027264a e73d655d 8139d549 7c2f55a3 de2df8a6 2770bf10 ff988c36 6d944920 ae9cc543 a069dafa c463b8d2 0dc764b4 3f3f095a 1d97943b 1303b5b6 1bd71c44 787d22a1 3a4552d8 833b35f4 1c14a15a 560280f2 acc4f867 d43003df 5960da74 00565ce9 121a7242 688ed52d cd4e4989 a1542a1e 1e20fab0 b10fd3cf 60abe965 8f020631 8cd591df 7f7b6e65 4c9a6ae6 c58915b2 2d8d0f6c c55e04af b7bb4fb6 49d5fe0b 0514de81 f75e86e1 11b98dc8 8c6e7eeb 9a6bc468 5b9c4f02 a7308b69 785a35ad 7ba7b8e1 6d022ecf 3a7ec7e1 c052e1ed 4f88efe7 9b19d3ca 1358a606 53b928bd 3610a47a 1477ec86 03329d9b c7b5232f aba21f73 686b5bcd 1a513075 9b0af42e fe470a35 c9f38764 c3725498 557daabe 54707801 2864b60f 76d6683c bd965c0e 5b5a606c d4c78ee2 fdad337e b63b8e29 5fef4c59 b0c380e5 f28f8d7b ff3fd4d1 3a38cb1a 679643a0 8f5681fc 5869fe1a baba14c9 f844bd20 6eac9d91 728dd8f9 f985a6d7 49f2d688 feab941a 84cabb78 5218edcb f7b292d5 dd525389 567a9061 f580aa46 58104e7f 22b43eb3 5d9f7f5c 0af317c3 1e3cfbb4 d9364ced 719ee3fc 9004036d b1a3ca54 038c232a 2c164ad1 2137d6c3 25f3ff8e 4e415d5b be3f9382 804432cf ec8663dd 34fa3e55 0f901cea ddef0a43 c26a22d0 b130d51d af91f6fe 7e2c0765 4d24f298 bece30ee 129fd40b dc370fcf 3cca10d0 ecf2718c 261ba893 3f6cf759 afe9f1f2 b9f00821 c9286e1e 3bc48c88 4f6fd95d c55fcb10 e7281186 94a9ce0b 580b6ba1 362f73f6 1f0584a3 87f7c3ee 94aecbe7 a840f938 9c7fb6eb fb2d4b74 23819134 a9b6efd0 0384945c 972a44ea d51cc8c8 aabf9960 4e227620 8a0e7c6b 50eb4d73 2e6a8ac2 7aec5185 a83a8050 ff185a81 a628b294 96cc538a 42e2c8be cc2c9ef5 cc97e4c6 47313ae7 407fa82f 6c6dd5af 7fc47ea7 979bc89e ba355d06 f72aa54a 512e23cb 6a2b5443 76e051dd 26359353 c75f2446 66cdd4a7 614c9e24 4be70160 669be685 d4ce1381 a4d1b5cc 5eb9b592 97490dc0 fbeeb193 bca4ac43 0ab9ce60 76329a8c 9904c957 57064294 a7d33306 f0d23f7f 854d16ea 8bdf8d78 4f2cbc48 b992f34a f322cf7c 4be50c4f 15df8e09 3d095ec7 5606b194 645e00aa 7b1dee9d 0ee5612e d1c16afc e8cad228 9fd2e7fe 7f942158 e616fd9d 68824f95 dee61c36 a7e7033e abd3748b fa0ca317 b6e6cdc3 370a2c0d 330cfcfb 9ec82344 f82ec477 f735dbdc ae6843e0 decc0495 67091d4b 067e16a3 cae269c2 9c3d654a 5ab8973f 3e3356be 993fcf50 7b07eedc 05ffabf0 da2ee2c8 e1feb5a6 a4a0dd3e 1743dffc b3e8478e 79da81f9 aa8f644a 7f83a01b 78be2c49 7b7bbf2e fbc052ef c63084b1 f13054f6 54729ff7 3c067692 fe695de4 a7288cbe e5631f79 e19250fe 1bbe118f f1abcc05 1a90dd36 b1ece8f2 7e62d048 b7094786 9cedda10 378310c7 020ef183 f6213ee9 48bbc39e 5032a378 eefb06bc b32f65dd 6c61d9fe d48080a9 23585a8b a4127dc4 57499a6a 4642b370 614e2bca 0e260859 6eae33c3 0640290c 6fb8ad64 e128113e ac8109cb 3b1b5d90 d6d6bbf6 6287eb29 c07d30ab c0fad5da 19d7a35f 084b8ad7 8cd40cf6 c5f016c5 49197f93 58734b49 e2fb33e9 000cfd6f 65f41bb7 2e67edfb 285a573a 7f47b76a 451ac1be 23139a8e ccfde4ad 2eb0eef6 7c704adf fadb3ef8 eea23a10 0eb1fb47 711edfbb 2ad7cd4f 4007c5e3 dd0ac275 4f8f98c4 8ab31b73 e643ef92 c76f78b8 673b3fc9 9b072053 6520f9cc 766b9131 80893e12 dc29e2f6 b37c62e5 120dc1be 3e29c5a0 3307e199 9bdc5ddc 445e425e 0e39721a 42cf5623 43585357 018a3c36 f44ed204 c2b7486f ed4a74b0 c72c79b9 cceb0e79 13ceeff9 e6724550 55e5b046 f0079186 1b1191d6 4f231411 2e0f3636 44c52494 0b7f4b77 47e459b3 f1f683b4 f590eee1 0b6c3c19 028634c4 ec1eeebb feefac8e 7da5aa22 0a0e3069 a19a1b0a edb05710 e1ec05a0 4f11fc3d a4874b88 966424fc 18c6bf70 d2c9aa52 e66ef01a d9dd6e98 c6075777 fe665e62 3cb8a9bd c09be7d5 2930547c 24151147 67986044 21a44a54 17bd630c f853ef5d 9b65e373 0f6b0bc9 eab38bab a5d2b326 31d61a46 24e9c2ec cfc2d638 f710746a 85ca4d84 3f2dcedc 4ba157a1 e29b1ab2 fcce5192 51d3d907 ca106554 3de57c6e 22543139 cb3c5193 ee8947ee 8a282b7c 0bf73f9c 4fe355f9 238794cd 93ab0f64 5dd68f80 ace6c7ec d94289c6 35569c39 b2c4bed1 e1cbf71e c6e7f25d c4a0775d 4057fd43 2765d677 06ea8e2b 6f72b0db ca1dee64 4cde9dcc fab5dec0 53254158 ed8e5aa5 4c01016a 99ce4c01 e6119cf9 8ba297e2 50c53340 15346ba0 c4bdc0d5 e336fd85 15aa519c 77b518b8 1fbfc324 38fe7fc9 3b437db9 fbd31aa5 4f57a5fd ffa11f35 21d2635c 5ba6151c c2900607 d231d465 6c160246 ac197729 71e1ae03 0fface8e 7041b9f4 b6d1e0ef 857b5f63 c295c7bc 734a1e37 721a7019 bef62d36 7515ebd5 f1947b89 07c3bc93 86c5c9f0 ccc2a266 cc559ccb 59ba2bdc c2401255 23f19596 7f90df7f 49921926 5f3bf7a9 71f84848 b1150733 15393a19 7734e0d0 f30e8397 7c061ce6 54e471a4 7d8fa004 a002fdb2 38df299c 86459137 960ab5ab 51a8f2ec 7aa86888 7c73952b 5ba0bfc5 aad97373 871e922f 460a89b6 f0a15f22 c642461b e10e3199 01a2a363 49df6226 12a8eb6e e48afe62 5f4e4e87 141d8031 4b18e830 edf0841d 481307bd e6c97f02 8ccce24c f8a493e1 7fbb9170 d98b40f0 7203daa6 c2f7e158 cb65dffc f405c867 4e71b451 cb9600d2 bd2425e7 22f4ca8f 5a639f70 b007326e 098c7cce 35cbe584 4d17c0af 87c34711 717df23d ace70340 3879b065 31b0b0f0 e6dd0e56 64deb46f 971a4aaf e1be8f30 01ed5359 3312b3fe f651e1b1 a72569c8 53f8a4a0 ec42bc08 30b19712 30690116 7862152c 66e48eef ca6f5d90 f690f491 4102ad84 a4d132f5 e5d03d29 fe09f4cb a1ebbd73 7b7bf5e7 dfc7206f 651541ec 76ebfe4c a206f3b1 d9521a45 9bcb16d3 3e4c9115 4c7dddd1 2b713ae3 5f447481 e1ead629 25b0346d 7d06bfcb dd292e6a a1b465f7 6dccb6e7 ff7b268a 9c90a2cc 1fd607b2 ec9d2666 9dda7e3a a11c12b3 a178a6f7 75b8f29d e35e8d8b 2b57dc21 174b4db0 0e1a08c5 0b67053d 8b34514e 5bfd6e2d bbdf1e79 e3162d8c af51de92 22c5319a d2764611 5bf3ac36 8d180666 f07d2294 33ca2362 1bb14407 f439a8ae 495c14ba f819ea7b a4832374 e3273e7e 98c41d18 14d216c1 6f301f2a 51042a87 d28e1bda 7b688bac de2b4e8e e7f107a7 7bbe16cd 517282bd 86b2688e 67e08cc2 f1945139 70809a28 516fe972 31e71610 9a2b243b c33dfce0 462ab978 3201f5c5 878002c4 273157bf 91e1f3c2 b49aa7fe 9e27f55b 6c0d2ce3 79015c3d 42a79707 63f0fa96 8cbc4c26 27174f19 aff325c2 6e8c7038 f85103eb 97d662e6 013d01d3 62318abc 190ebdb7 9ecaadb5 6a3eb4c5 4813f63c 96d60cd7 db08a6b8 eb51e818 86363d93 2b365ec1 4c843bdb 6cf39bb6 865f1504 5f900eea e8d95840 6c1c5197 2ca607ba 1b224698 f1c2968e 9a51a279 312bf2c5 a25fa524 4074429f d056ce3e 91a0d1ed 6b31e9a7 935f594c 8328113b aed8c863 e5ddeb1b dfb3fd22 20d7d262 d29ef999 da877e93 3fa338c1 7d4293c3 aa6caf5b d8cec61d e1a7cfcb 0be18b4c 2fcbf0ef fb2158a1 96afc71f 24458ab1 82d0cf2b 091f93a5 2ec20620 bca812df 8683f376 83e17e63 052110f6 f3cb211b 995d9eea e2c2e443 8d8b607b f6e00022 950f8033 2dd32145 10ad8a58 b9d56c4e 6e070330 3a08384f d7931408 ee745b11 8f487993 edec425a 82e2b8f2 1b26abab 5d668796 ae7b2afe a068b61a a1fc3f2f 4bd5c88d c01384da 792129f6 8f404193 ddeecf09 ee7f38bd 1c57aee6 b5be0106 3502829a 6886ca9b 3e33a1d6 6e0e9e37 85056bd9 4a5e2585 9249c50a 4415649e 86ed2943 043bf1f9 0775f889 7b479ad3 9e86a7db b0e108a4 6af6982d bec47acf 8829f8b4 45992739 f66f7283 66f362d9 4a168516 5a62fb46 d5cb8695 33b84d8a 801acd4b e1741b3e ad186416 723f1a2f 7f6f894a cda57ef5 789e4995 ed94f109 b81e8192 e2241352 6bf749e4 880f8f62 9aec087c a2f16ed2 b4365a93 b6b16987 6a655c88 f9541d7f cbfdaeea ccdd41f4 e8a04cba 908e97fd acd794dd 5923e5f1 5f95b66f 03025735 1ab6b564 54bef0d0 8b83220f a8ab33d4 67c63286 fe19d6e7 766dcff8 c7b98274 a2a8fdbf f714845a f56b9fe2 203960a5 3de438be 65094e22 218e76ca db8d492e 704a88ca 758f0749 110618ef 40bac5cf ff5f2e72 d33a6c65 d4d37e5c 910cbbde ed456d22 2a70aab3 e0334406 8ae8839e f929eed4 c8cb1a69 8b769161 2afcc06f 3db1b430 04310f11 33c4e17d 3d03f6cf 0e537499 44e7125e 18bffc8d 9e0708f1 b4595f86 8f3ac0b4 2726fee7 2cb04300 c9fd0dea 9dbdab38 4aba07af 055c8095 e6cef3d2 2a0dbb6f cbbdfe2f b03536a7 110e5c11 8c4a7713 2fe4d3c6 7fd0ff36 fad0e035 f5806347 a84bc17f a3b0c297 b9ae5e74 5d51bc40 ecf8cf46 31e9e33a 02422763 3957178c 689ecd01 90d37bba 0d4fcb31 749ea968 29e62497 99dc4460 c13352b0 fc1704c8 ea436c3a 396fe826 301f0e1f e94121b1 5db401a1 8c9bccdf 567ba749 4998dadd 03b738a2 3f033a90 5603b4f1 bc6637c9 526a4c5d 7358ae0a d351d6d9 be55fffd 005b1b29 f9ce99b5 e1431091 108c98bc 8c824a38 534c5021 b11bcfe8 b8ae434b 7ae468b8 9951dd41 7877f871 e70cd469 1abb67b8 5249b93c cb85d4f1 7597d474 15b9eca6 eb880798 c467aa75 e2d837e5 e65f95c6 ce232cef e2232bb2 3012c6a7 f5ee2dfc e43164c7 47b85b69 53f0d175 2b530734 3fbe1f15 cc43a702 3aa9d947 3ccf8020 79200ab5 20ea48f3 571a3acf 468c9811 aa4e30c7 78873c0a d0c33fde 676c5cd3 a07c9142 c891db41 22490bfe cb176736 38ebbc98 32830ba9 314d572d 407b1274 988e3427 a0481fdd 2b3251c6 d204491d 03f19adf a33458d5 f4432b0b ee37391e 487cec45 5ca646b9 a6b6f226 bedfec15 6d9ffe7c 9622e7f2 ab02e4c6 9a5e4c55 009bd3ca 0bba8355 13a546d0 b7ea967b e326f0e1 0c4e43cc ef1e8e8e df2a37cc 1b32c45d af4035b2 7d38874c 935f9f26 ca7cf292 8a566552 02271d99 62d2f254 68237d2d 1c903a7b 83da3cf9 e76d3e59 8e3319cf 7ab38c8d 4abf63bb 535af387 d102a06f 0eb1ac69 dc09df6e 2a9f4e1d 542b10fc d758fece aa1a1140 771a7590 f8cd9fea 9d5a8fae b2ebc82f bc4bfa7f 4f0ecb73 492bd91c 4b844475 c5115e48 ea7b692d 23d48c1c 7fb80e9e faa604ec d09a667e 1a335112 b794643d d71a6f92 127e2fa1 24e6db02 22d6e655 91ac3274 513901bf 1d65880e 6404b5a7 18e00de0 f4c89656 fec630e5 55a71a7d 691bf603 dcdda71d e958b38e e0ebcbac 8cd8ce13 988da18f 5b49999f 4d461a44 8bcf9ab9 a63df343 1a29c3f0 b45e8963 c63c9af3 dfb719b5 073a39ce f3ef0e0b b3d7cabb 235b56db f5ef712e 0202b1c0 c888a7c5 a81b5bf8 ac85c60e 82a7bb2c 426c101d 8a105403 609d5f4f 135abaf5 c117394f 68981b49 ec3be153 e67f2734 202819b3 74908c2d 5fb1cce7 b6bf1e07 6a380825 c6eefb67 1dd5a1b7 3e4306d9 4f773f22 346b9aab 2230264e ff6b27ae 7971944f 9d38dceb 0b6ed748 b38df0ec cb4e641a f6a44e6b ceea9f62 b0c6b648 3124e133 1696e1ad 59d80907 fd7cfc04 be46cafa 42160e18 b21aa6b5 7b18a1c9 fa6f5305 bfc378a7 21153994 3f2904f3 866e68dc 444f2cfd 3ef76124 36d49e85 b3b08bfa 14f24a28 d6cfe071 fd53968f 5ece6bd7 59b0628d 41af0b14 431576cc 5e4b6b03 3018e2af 36df230e ed15b6c7 a984021c 1485e3c8 76a972f9 b4a21fb1 7abec2ae b6c3f0f6 cb727329 1a9dec73 1f84f8fe 8c7cb77c 4b3a2cde e10d938b 897d2bfb ca664fac 7e3428ba 25f4fffe 46ff00aa 00ed1000 5f080402 06624120 36cdcdb6 16c8f5c8 52b5f7d6 47d2f4f4 16d0dfee 72c3c3df 6cf2d6f2 4ab6b2b4 0f250000 cafcfeff 4d1b00ba 089beef7 0ca55553 86731b3f 1ec4620d 6debf21e 6f756ff3 7d3b005c f28acda0 ffd958c2 8eb1c097 603d0ee5 5b1c6e34 9672e509 160b6230 448df376 e87a3051 6ad78f45 cc5ac082 dd8207c7 31ab0035 344384e5 8488e60c d5ff555b fd3d9b2c eff7274d 1f942a44 4ccaa173 b2fc779f e2f93bdc d35357ee 5f157be6 582e7ab9 b77f5a67 68278144 a66f72da c50a42ff d2de01a4 8182014a e9d22c80 b399a7b1 bc8e1c51 9a192ae6 2010d2ac a94e0a97 17e14838 38de4e53 b332f5e7 017e912e f5684e89 70868bf4 cced591d ebe05be1 756de1d7 80a65032 e5d283d7 086432c9 b63c38ac 98bc94fb c80c2a2a 2c603643 411a3999 e88d3953 71c318bb 98548d98 ff08a894 43fb58c3 db50cd1d 487cdb2e 030f77d7 88138363 08c390e7 d1c1dbdc c07a7897 16ecbc29 7f95cf23 bac5d72c eca7ded6 8fd93b4e d466e7ce e055a367 ab993f90 a627873b 062c7c1f c3ca35ac 3d5e047f 2f50b9ea 7409d871 521e69f6 f823446c a6ec23cc e91128ae 09d32230 b21f59bf f8ecf558 8935c846 e8f71530 cddc870e 40e53bd0 5c7d2a13 a409ffb7 e6761495 6c7fc212 ad8c8233 a3d93179 75a2c7e9 dfa21957 dbb6b86d f016b0f1 021ef588 20bd8ec8 dbb8f44b 60c79def a46f69eb ba40edfc 8c992b56 7deba162 04576004 fd8023e9 43b228c9 39419d20 a945b1cf c5526b2d c044da37 ef3b686a fb6e73ca 9b6b63a4 ad9ddb9c 89a139f6 c7398e29 22a0f76b be0e7f21 af8af917 6239fa44 4da02edd aad30bb8 d839d9a8 ef221863 0c7560a6 c9423ac9 5c8f6f45 19399296 2ac7ee1b 70ccb947 fcb99625 c76705df 4acf491e f507a917 da97a1da b4e1306f 7dbdf725 83bb9d8f 14b735fe 7ddc7723 4384b8ef 41ef2890 4e9c51c7 7f97170f fc0ea44b 4b72b628 f98e7229 d51a5b53 c7631185 854358c9 59ae320b 1e158ee9 137e6a42 e85e1272 8debdcc8 13c61627 d16eb22c a8dab6c8 09a00853 3175c464 9b703356 7ea63a7e 6e0b6a0f baa4888e 80531252 af09bea9 e631e755 bd073518 e3675b33 9925c397 8c82a80e c8747db8 f6142303 c7c67cd7 1f835508 b7556b9b 10f217b9 3de80633 6343e34a 5e3d3dab c6655448 b37b805c 63e1dd9c eb996c65 6f08e2f6 269ea9c5 ed3881f4 9f20575e ab607c95 6834007c 881c62eb 13dd2a44 1b229895 a25644c8 2b2c77f9 9bc0830d 77af1b5f ce612ed4 1a55288a b426dd4c 4fef275a a1796b48 457e787c 03b20770 769f36d4 b36f9f2e 48f5dc06 8c29b6a6 72e5529f 08a79240 3b43445b ce719b60 f0a639c9 284a7385 0ca34e20 6a01948a 6cc4d744 eb64b241 625aa9c5 34bdae07 2c7358b5 2c0bf21c ac18bc7c ed8072a0 edac2b4e b0d10218 ceb0c0bd e07d3c2e be4df5be a6847b8d ca912d94 4ff53027 38daa4e5 995d1f14 ca0df150 65320c1e c74bab84 3ec23b66 56e908f7 9abc9464 1719a1ca c147443d 66a23898 88966bea 471dc125 7a5bcb71 3eeab5bd 715d172d ca4e9e80 e68b8933 1beba5e2 d4fbd2bd 5b19f9d8 6a9db068 a81cc9ab e4230983 161106b9 2897a0df b67c63dc 581e8e66 59acda91 d3d7a372 0980661d b2b264ef 27e6a1dd 0f4efc19 e5791039 ac32de68 d7646a34 ff4455b9 09ef3a3d ad3000c2 0db4448a 04583187 f3c142d6 1411d961 0d777ac3 79d5e630 b2a3d6c4 eed2b576 a05b6bbb 6e78ccad 3c00147e 81f6efe6 1e29372f 4ff6295e 6340886a 55b16eb1 43d8cc3e 3f969b3b 264dedde 497414ff 6179a570 005acc34 41171555 70ef1758 2d13fd50 3cde5400 537244f0 3179f179 4ad91b3f d5e28fed ce94073c 30aafbfc dba24bb6 c3936283 6b971fa7 5e8e8ac3 483bfb41 ae9668a2 85df5ea0 e86f3d0c 680916cf 7385a8f1 f2c56102 02fcac8c 0c0b04b5 494f4f1d b82e8450 d1500d3b 79e1daef 03006846 3080781e a87ee075 fbe05726 627dba3b 23c8b901 e830a67e 3bf7346d e0dc14ee 9c67f100 b5033528 44cfd3af b311c0df acc81732 261a038c 16748dd2 a2c6386b 761f860b 352b362a 72067a53 86fa8f44 1c792782 4502d1c1 490f92f0 dc324b9d 149c8aa7 0680f7e2 3299381e 28814cf3 8cd98a65 a28dd7ed 6f4e3b4f 62470033 5ae5d728 e5beb453 e5bc16c2 8fad2ed9 874be6a7 7d03b115 716de284 754c50bb a136b5a9 a8a3d812 b42399d2 35d2a053 fee01b62 af2b5f97 3b05c709 f1e4197d c924be1b e54446d5 f52f64a8 e8e75cfa ad2c3a10 4d737ef3 2c09445c 8f208cea ac79599b a18bd849 2ad9dfab 862b942b 0f7e3dc9 695550c5 a33714e1 200d0203 edbf5d6e ef217880 9bd22d94 9c176b0e a7b07ce4 8ff746ec 7b3c054f b55e676f fe26d6b9 e4726c94 486984e8 d09298a1 ed4288d1 5581969f ff75d200 957b7deb 70ad961f 67f08b2a 8d6b531f 596b0c3c fcc6f4e3 976e86a9 344c8b9c 9f54f5f2 39257f0d 4164bcff 6d118d4e 68a7ce34 14363b25 f4422288 e8dd7b73 e0a785d4 b0b56904 36aea5bb 2dd51c56 2d130d93 cf4a7369 cb1fb4b0 c6742b51 e80cb7c0 8874bfa6 1a859693 87b058a2 b59c5e24 f4e7467b f2233005 b368db7f 954f8e4d 88474c28 37de2b43 70ff93c9 172f082d 2ce8d44b 4215d0a0 f4210d95 173d2e1a 27268c0b 3100c1a8 5e69c4ce f718e858 694dd4ab 46dc981a fecb13e1 873ffbc6 8278d7ee b106c392 a6f1dc8c 7214d932 13863b41 462aefc6 747f66c1 2f044d84 8e9b813a 9865329b e4f9e72e bf2db462 b6905afa 1e39430e a791ce22 f5e235c3 31ea8662 61c4c854 16614dbb 9b5aeeb2 f49489c7 9f4c9e6f dc1fbae9 db21f2fe d5a6beb2 5eaba069 d35b5cd2 711f8bc4 d42e7f79 402183de c7aa0c17 bb2ec9ef 61ccc8f6 4516f146 eeb1d868 1a34e4da 83120ea7 bf130cdc c49b2018 89c5299c b56670af 7d990a32 53ad827b f5a45142 093ec6e2 f564bd88 7db8bdc8 3fe2c142 dd2e1c6f 0e4476fa 5c7aaabb 4dd8e6cf 65be3e3a f9281c6c f1a59d8f 52e14510 f48d5b97 77765dd7 8005a4c5 c04d493d fd39b6e5 472fdc30 4331fbc0 e48a8822 05396c57 fa8ad53f fa1a2af9 b1b99179 63f5fe60 c6b90ee0 dbe53107 9a2db1c3 24fdb6fb b1bd6ce7 4041e138 bb1681ef 51d78c99 cf85a1b8 a38e5ad1 3ecdbf86 65e9f1bd 26a94a7e 70816b57 46f60c4b 814609ab 1a14e7c4 f2f43625 1fbfbb03 2428a3b2 912a23c7 05d08c7e c49501f7 e6ac9d91 1af93da4 e332f1e3 17746013 1382b252 42c685fe 9facc332 2948453d de9a2887 f4f67767 314bd521 781b8ce0 f740a87f 94d37371 cd1e6c5e 8fdf7b7d f98fef7c fe51e0b9 4d7d7ca5 1f9b4632 f2fbac4e f2488476 0782207e ecabdc4e fc968822 024469dd 82ac49ed c59414c2 8289c09c 003c47ce b1c04f9a 4d2d474e f253d383 409a7ee9 099aa553 490d87c0 76fea248 61f8616f 3d3a4e6f 29ffcb84 cf5c2fbc 9236092b cf241c90 ee771e3a 25ffc88d 94afdc9e 31e3c78b b6784d61 b3072d61 c26cf3d3 397e0ea3 2db98bba 1b12d1bb a31d6669 35dbab64 e937455d edc3e575 d604e72d b7f3e59f 38bd288d a1095971 a0d8ea0e d1acadf0 1bc89a56 374eb7a9 3d2d6782 3ea075d9 8ee1c0fb 62257336 76b1923e 6fd37cb5 7e51151b 1170bed4 b4aade4a fe20b6ed bd887e29 833c3a1b dda3732f e98e2829 49594139 dd643bde b614e96a 8bb557dc 660dfb8f 5d70e035 6e6af0c5 8f5224d2 052ad052 d8566c90 6f170737 827073c2 911c6917 dbcdd893 0421422c f597f91c dce8231c 6e17e10f 8fe56b9c 610ba146 4870531b 7e2a65ac 0a309aa7 9aec7a43 8c294e63 9dd9395f 9ff36830 fc680451 ecffde65 a15e02e4 233507ab ffc7e832 eced96d6 2c107411 2d72a6e7 224961c8 58d3a2b7 4bb62d48 839a64df d55e7b93 a648bfd5 e5bd6dd8 30579dcc 5fc3e195 53a436a7 79041eb9 eb9e58b0 b36c205c 600db215 1dabeb19 d7b6b831 debde3b9 5f73e2cf 5abd6995 f656236a ffa1a9b1 37e5b398 7a0d172d 75645dcb 2a07b111 5d11d809 4980ace4 39e15f02 9725fd03 106d6530 768d3a11 a41eceff 8184883a 5d36d2a5 037ce301 b37e28c8 ceecd8a9 bd0eefca 87342b68 8844b0cd a98167c9 78eb324b d0e7364f 60923814 f3cca299 0ef25106 f633645d d08c9b21 6aad6fb2 95d31431 44a6e0ec 47cbcf93 19b4f95a 8f162aac de79b7e3 307bde52 13320f7a 3d4b5013 9770ea99 802c2a76 d0f6ed0d 2666fece 063f1d9f 75a3053f 47b12f30 02b5790f 7b2c87a8 c226766f 17970f69 af0a3585 48dd2b4a cd940bd8 6312ec68 a65e51ba 5c57a883 a57993de c5124f50 1aef701a ee94840d 0db0f168 ee3200c2 31033d47 be73feae 9c0357bf 8f439c7d 9aab38a8 8dbe4012 82a0609d dbd0ca08 74f369ca 99050179 4ced1389 fc7917a9 f86d6906 40ab2bb5 57a90f50 03528aba 0f528641 16d528c8 94580530 d3fe0f22 9b255942 5f44a4d9 d40d2768 b56584d9 64876fba 7f1ca7d6 f7d9aed1 0c289ac5 9f3c8cd7 24f03ec7 6dbcf7ac c0ffda6b 3725e89b 56e6d7dc 47b26d27 1808ee1e 959e6e09 bb0b9aaf 600ba2fe b644ae9e 40dfcd2c dfe46f07 b6e1948c 1201dd1e bac9dcd9 e096d5b7 6eaa78e9 4a93e169 ea3f66d8 3f8d25fc cfebcbb2 c667c655 dedfa109 fd51896d 651ed3ce a13064fc b8d365a3 4d1408a3 627daf24 15daf3f8 d8e1e675 04cb6ba8 04d254b1 d1205961 e6293c54 5c7fa9e7 588e563c 62fe7057 fa2d9a58 a10c9672 dfbc5bea aed88315 279ad143 1a9c0410 96d50c62 4c8a13c7 487e9aae 5744ccd2 cf5c870e 8bd989ac f79163e2 10dc8cb6 f8465103 ece19538 86d2e541 22f06185 4a1c874c 34bb0a86 3d3ecc07 f6dff2ef d92ffc80 a8527aad e47e0709 9f1a6018 c5326896 119d4184 f0c81b14 c1ee4613 20f56550 f59eb3e0 6bae6e8b 9f33b3fa 3682a1fe e8be6f28 6535b26d 2b448380 08d45e2a 07a8217b 8393137f 6085aa80 07ef36c3 789ec3c8 57b1ca3d beaf5961 0be48c25 108812b1 f9d15a82 c4158aa0 98b6fdfd 5b4b5cb7 2ef90fa8 f6e85ef7 b6cb68db fbb2dfc9 f4c43a6a a74ef7f8 f52cec1b 11e112b9 081b3e40 c38238c7 e7e9a838 647fcb03 fa481d01 4dad5731 61014c8e 5cb7afea 21ff7b13 21653e6c 7c094897 4e9201d6 7af120ce a9e606ba 048a3033 25165cd0 5a76229c b8b1372f 1bdfe409 36c907d9 64d63588 90badcc1 d82add5c 5dafa230 1c637104 fe5f1444 d7cd1224 68c2ace8 5a28bf81 833444d7 97bf6624 79fbef01 55813fd1 09e0e460 6c743204 a59efc91 53aa8605 a48eebd6 0d578076 186974e7 4f07e8e1 55a4645f 0f0db38c 65d45765 554eab1a 57a2eb79 41d12009 02914a63 7938d771 ba942036 230487f4 f537bf1f 3e24f23f cc082ea2 761fccc5 92d717d9 c2efb28e be3f1c87 7d1fea58 5da5ed08 a940fcb0 5b4e8336 0a61d861 3b86b614 2a42ce4a 605b13d7 3ae9e8af a621b9e5 57fc9c95 c3da42cc 841fa0b3 1169205b f6e41349 eb42c619 a22c6047 d9e1b187 f50bf66d 979e5020 2862856b 71fcc633 b42811b8 23339c65 3f11174e ff1a523b 47feb758 45005d52 18c50771 c4e34eed 71f7f65d 77b17df3 a310206e 82817583 0dc798a8 4cab1b4f a93fce1c 82c18e58 fdd7f358 32552199 b10ea8f2 4a20a104 3db48126 65a166da 5e7341c5 48d13aab e3d447ca c029ce6c 18fe9296 3b794ce2 107febab eff4f968 08d263c1 e2b61354 371b8a0f ee88959a 259f16b7 12b41b01 a9193307 a555748e 980a51c7 0087ca3f c28bb2e3 ef4fd1bf fd3a14fc 5a9a53c2 55ff9012 5298f65a 0c093052 c58b8d6e 872d8c9b b8717979 24265f62 bd7173e9 dba5ace9 6efec581 9305cca7 ea8856ce 1e1aa316 48f48d8f 2cf0ed0b 5e483d4a d89f8da4 e3660704 30ec5709 37934922 f61ff5ca bc792537 2d861c50 5a89b153 c03628af 5da661fb afcc8998 b41e5c27 11a2d5b4 0788e63b fadc7ea2 6a30d3ae 6b7e870d a9e49f78 e40b243e 1fa9944e b82b57fe 8e997b14 d95b6673 b6a234c2 76dd1a68 509cc4e6 ff846c7c 565bdd69 cf46e87e 865787c5 b47ca549 ed771170 4c9d4205 9f0e5323 830eb7fc c2bed9e1 067fc932 c7d79b92 583da6a3 46d37dc7 82c25d36 11db2ff1 c0545c13 13b33e3b 1a57aa96 fe14d6f8 f1d57ee6 49261444 5deb013d 321825bd 24b2f96b 64caac9e ed938c70 6de7ef65 3984aa03 86039b80 6b668ea1 0749bb01 1b43fbc7 80592242 7a29f6f3 17322afa fa5cee5c f9c4f406 2e820cac 111fc1b1 572686f4 ce09dc7a 05a6f066 0f922e2d 17c15406 f332c98e 30c850e6 7a0806ce be012567 3f0ddf6d c9b600f9 39390f80 5467713b 0e4b7d82 acde1352 9af9686e a83bd058 c12b3ebe 314afbbc 93681a29 fa9e3f77 84c11520 13a4c05c 5ae8fe22 ca3af02a 7db07d57 863824cd ac8b79ce 07a2367c 75c85b5a bac0d514 d4760bc2 36d929b5 231d9eb9 240eb79e 0d67fe18 72082015 46b702d8 0490f2f7 e7598164 62f84f8b d026e5fd ed645ab1 a6675d1e 07c15961 1e38ebc5 dbe3ac5b a8d42d81 6e94f952 2aa6ee73 37a1061e 03c9614a 6a3abbe4 2ede5b23 31f7885b 5799724e 73c0c28a 8a245941 cbd819b3 4cc2f124 3423923b 89604e3e aacb313a 5605188c c1362000 2e4f5d65 ef27c7b4 b63d0715 be57ba9c b106ccdc 206ebcd2 e7571c6e 3b13ce15 de5889fb 553bfbaf 90aac063 f091e466 b394174a 803b3735 305236e6 caa254ea 27c2866f 47545e12 d83e41b5 eb5d13f6 9241c375 23a2eea3 cea13b6d 9d5afab9 107f58c3 c5e83e85 13440469 3dd25ac7 36412757 97f111f4 0523a4f2 d000d81d 7da65c45 c5a33519 ddde45aa fe8fd15c 42cba18e ca0b4332 4b7973ce ce500581 d2919ff5 b4181b83 64dd2563 12dd8505 510daa8e eb53378a e05255b0 04657574 219d0b1e 39a29bbc 213f9114 224004f5 b1e4df96 96829148 9741a128 a6cde930 047c33ba 95ec8624 4797bd98 09dd5eb3 794bb128 34a9080c 37aef28d 0edc551f a4be4fef 6e14a777 36b3fa6f ecf7b973 6f4b22e6 d329b709 a8b683a8 c7e2f667 1fcabc16 6136fde5 f1e058b6 864f7963 67207a58 1be6134d 09ff999f 243ba8dd 6f261f26 aa2ec99d 790f4778 c8618230 ba7d1046 c7435ad6 3565c580 9549dc81 84e57ff8 afbe6037 ba0e89e7 678a02f4 a944f1e5 110d4e7c 44715d05 b5ae454e 0aa257aa 8b5a2d78 f44ca18e 98ab47b4 ee436b06 186f1e0c fcacd5ce 98672794 0e70a65f 4b4a4940 d41091f3 69f10fa9 a2bb828f 54306828 06b222f9 d8bf9bb3 7ab799b2 bebc5569 76d56cf0 30635598 ac682e2e 49d67294 563181fd 83f4456b feda82cf 3323b012 17b33647 00ee4574 c6a6aae0 b1f02ac3 98c75f20 40aaa3d3 6f98f706 5cdeb349 746721ac 70d673cc a12bee2f cdcceb5b 62c20401 f1e13a74 ecc5c3ab 87afeafd 15abb346 ad576a0b f392790c e5a26e36 74f702e5 009f2e6b 2982ecff b8b27381 d8d36254 7e94a116 d7526ae9 107c7ad7 a63c82ee b99707fe 869a1ae0 cb7afddf 26248ca1 1a793cc9 8ad84289 e6093789 7a253da6 f9cff834 8346ec11 727ba57f 214c4b19 7f906ff3 c9e28d2b 34f7054e f370309d 2ec64a1a 2d7232d7 b2ebc14d 450ab03d 548f1486 e07d1b3a d225b395 d76481c4 d097a2fd 05db164e acf2f59f 7a63149a 5ea1138c 10e32b0d 7e6269df 68115bc5 3bdbfae7 4aeb6d3d 21c619eb 3cda4b6a 2c5a2f43 a421eed0 0be3fc7b 26ed931b ed00754c f4a1a1f3 c5382340 9043840e d277a893 3a13ee8e ab1da4f4 704fc39a 7dd73e43 9ea7a3dd 6488ad8e f6641302 c13827c4 51713e7f f3b89d2b 6b5e843c d02e2470 407f7813 fd21e2d8 4a1a381f c721f757 120cd7de 1aa1039b 1743bec3 db0b3ebc 6a11853a 06ed60a9 c332c5ec 4f593207 91e5afa7 56dae853 f5657806 24251eab 7df4af4a 016bd0ca 12dc1864 cbf4abe0 baf32ecf 6a83c69e ec60e1e9 a797a18b f84bcced 28b33f0f 3dff1c7a 6e8fa613 5ed390a6 948f121c 5e2ad09d 3ebfda66 9593333d 27192083 6786963a 732c6843 c8a13310 fee6fbe1 30cf4119 c34927ed 89ed3cf3 93b7a152 0fd7af50 4885a2c5 063a16c4 f3aaa051 1bb39bee 1f207b4e 6a89354b c1567ff5 4347d967 3716bcf1 8f53a1d0 c394ee15 5524f0b1 be9e2221 176b7f9d 3fa43b4d 9f5cdb38 db22f5e8 155fca8c 93a533e4 8f2079a2 9bd21ab2 8549bfef 9cc309a3 2ee9501b 8354f5a5 0cadcb25 317e944e c4ac2b17 ae4e9b17 cf128555 a63d6b5d 6ec98e2b 1b2480cc 55ca7247 5f196104 871da55d c90eb1ca 523a03a4 97a7acf0 bfd5b534 94e475d5 b0631166 4114d67c 0d17ee96 b06eb73f 63199bad 372a6b58 04b470a2 b23ee220 ca95ef62 4c88ebfd f82770b9 a35de8ae b9a42e6f eba22190 e756e537 82db2111 06367b10 83f576a7 a0504e36 8b09fbe8 be46bb83 5023dedc 8a250b6b c5db1086 15c049ae 7beb7cef 8c9f8245 95b1ebbd 6bea11da ad655e9b 27260c4f 3441b7e6 1c10a302 cd9f0347 64b68e1c ff661c09 4cefe3b7 24302222 b611665a d7085f8f 10ea43c5 04735664 85edadc5 dd01074b 6a46a9a7 c3d04d0f 60a98861 9529a775 ae878db5 e7a2e63b 9f9c8708 c5ef3b5a 1175f265 f129d48d 2c46827f 7b0974cb a958aaf0 22baa4e8 f9a14462 185bbc43 7ebbff1a 549f8602 275c4092 f99780c0 52f7d3ec a6a0f210 7718afd5 f80785ae 1fec8543 2e3ea0d5 acee7639 9e02aa77 c990345b 34ef0cfc e2d5bc1d 3cdafa22 28a7c707 ae3d80f5 ca0f5b08 435fda64 77cf3430 5d5085cd 54663f25 c414fbc7 638ffc0e 4523fed2 73631269 f439528c dad9edbc cdee09a9 3ac82d86 c62dde73 c3ae5c5b 12deb4cc 028417f0 a43ab205 286c7713 bbec2102 1b6ed672 a70e4b01 f5f943e8 01742920 8f84fdee fb24cdd5 dd835081 af9977ee 3433793d 251e7ac4 48e2528f b5a02960 f9b2634c 82106dfa 775ba74c 9201fd6e fd731e2e d1f6c9cc 6cf5d009 170a3ffd e7d719d3 98f4b062 41dc4407 724fe2f8 4c2fdfa5 4ba5fe98 3a4c2869 3cdefabe 6e0f6ec0 eb20d8b3 2a9b2425 2e2a1619 67b818d9 24df1dd2 3a01cada 99f60ef7 5e67d7c1 26697d18 d7d72084 5d8bc326 4ab90b2a f2e3aa1b 7a3219df 1b1bc4e0 d205c723 ebbe8def c3479368 4317491e ee54a749 0bd12f5a ba6b6f08 e515d986 544b6340 e52d80eb de897790 194e6e39 6fa7a229 571dbd29 6240a504 eb951537 2ee08a05 ffc5dacd 0eb8b1bb 5539908f ceabba56 14908a17 59655879 ce15483c b21b2802 792392fd 988bc951 863cb5c3 fa0359fc 4bf4418d 5a10ab95 3efbc242 091eab04 8febb448 266ff5b8 7d2be6f3 0da43f8f 2aeba0d6 0cf3ae15 0755b93b dd3b852f 701a23d3 46f40403 d3ca5914 3bafacc3 74628ced 5049c2ef c09f0883 a1ead068 a3274c38 a8e7e40b 67a777d8 a6ebe6d5 46cbdfe3 980fba74 7c71cbf7 afb4454c 2cc33e31 45669f22 33d8acbb 8ffabcaf cf2591ec 38a67963 e1d1f7e6 5ef5d297 f8793f72 69a1e07a b7fe09b4 4394fcea 8ed68723 aed06363 e7621c65 54002264 991e7f14 32ef6bce 670fb812 fd9cb4b5 aec6eaac 2054c319 c881e91d 2a9db717 c7ed08b8 43a7de71 dc221a1c 7d1dbd42 83283bb8 866bc1b7 9c4f4832 0d4561bc 45bf2351 a1f207ac bd6c363f a733ce6c 05d6078c fd849b6d 7694d431 f1845f1a 6a158ec2 4c90182a 971febde 24046ea1 13549ce2 b0cb98e9 d0ba566d 4c375d5c 907e8647 89cd535e 626d66cb 484a6150 28e09181 63135f8c bcb89b1d 57d6e302 5d631341 ea999a6d 7ec668cd e1f9487c d3e91746 5015e5be 34c0cece 33db9a9b a10b763e a5e5a79c fd05b5ec d8d731df 36eaf352 3a6a4fd8 75008061 5ac9341a 2ee9b1eb 7c74decf 5eaf11b3 a0438d77 d622052e 65a89a13 7e625785 385259b3 69b4fdbf 95110a5b d5f5fb73 ac5e5de2 aaed5d94 4e826a05 a364196d 63b7e300 9c30ffaf 93a7db9a aa1411f0 1340572b f92517e5 9cca9312 26933a48 b28e7054 e380eac2 0b5325f2 c3decf1d 2babe5e4 a1348d8a 396991ae 4b08e305 138122c6 eecd8079 152de904 20ca253f 4fd22acd b9e60599 7ecad6c2 885f978b 14b3e0da 22e4896c 53c83ad6 9ea9e342 72c43045 57e164f9 b68962e5 8c0a4bc4 391d62f5 c740b90e 75739bf7 52029c49 a5a96f43 2c6a58fb 545c3b86 c2c74b0f a58994df 40ac9723 551cc32a ce2eefc0 338bc5d6 5297165e 6341575b b3c7b835 2c9104ce cce560f4 23d61ac2 035d214c 8c1b1a19 cfabbad1 448ac4ab de76a630 e8baaae5 cc88c110 d1d63fa4 bed43d1c ecafdc43 bbe425cb e43df388 18f8620c 51956423 d23b513c 4d63b15b 6d403413 fc3824b0 3b62dda0 b7cb63c8 734654c2 e79188a1 8fded28a 2946dd1f 79a7f25c 9afc772b daf5b19e bf32ae84 2f4833ee 0dc7f02a a9552bd9 bbe9241d 70e5e30d a37f7ddf 0a748e43 30e07161 fb422ae0 696115b3 b26181f8 a853f399 68fc549a 84df6c50 39211b6d e991da0e 46f018ab 2fb746b7 6b811af4 df42c080 7df507fd 62ecfb26 36d643a2 667e011f 9721b78e 6258495d d99ec7dd 2364c0d9 0f1899aa 3d04162d 9f116622 ed9c11bf 0ffb4b1c 33177ac1 8702ae89 297ec61f 5f947807 83a0d535 1aadfdfb f9e23818 16ff04ba 911de613 3a31b708 a30e213b 9e3c8ab3 1524513b dc6f2a0e 142c1372 ece2c172 22c7047f fb6e012e 8913cca5 2be079b6 65b4d581 e279df43 fbae0a08 d53efb91 8b12a6da 58868baf 9ce724fe bcaad777 9231e0a5 6574c232 95d18f71 27b89bbb 40668268 0ea308ac 7ecc3f5d e670ade9 2c6ad2e9 3d3f9624 93bb1c17 1cf5af62 61ec651f ff3018c3 e49ded53 50311c1e 44da75ea dc12ee1d 1ba0a8c0 7bfb4866 3c5a5184 3fc4513d 68a44dcb b6b978b3 19f1b3ce db6ef0ed f37da54b 63753f16 d0ef7136 7b0d8e92 2f06272c 55f381ee 597c6360 24f85812 075316ff 61ccf73a a4f25213 535741ba 59255fec 98a80da9 1a6ae4b7 d8554135 603e6955 03f36d69 2b2faff3 29b37db2 b6d1ebfd 7ce8a449 ee536ecf 98dbee7f f3c0bbed f8d17edf b4124afe b0bfaf9c b404f58b 630589c7 fc236983 d0f6e207 7bf2d4d4 077655bf 2f601f1f bd6dc2be bec8cd2c e5807438 b00d7dc4 10d7f19b 8aa8763a b1033d0b 11484c3b a74a5675 1f8335b8 3fe7d723 fe21ef76 e65b2dec abcd84cb ef50cd72 2604e6c1 96451343 222c1a58 00986a5d 43a558e9 1d044074 4b7bb6b9 5ffb57b2 faf46f99 557cd326 11dbc109 a9e4b5d6 580900b9 91767f38 2c55da6d 68b515af c02c196f a3bc1268 c7dcab79 28a18358 4ecee167 c240af8a b20303e1 dbd27fb5 d56d5936 5a98016e a7171dfb b690dd09 e305f0a3 6e2b9fb0 005d6f65 71002563 36e8c8d2 e76f01f5 8c0e5d40 5f3e49a7 1b573f9d 3f82db74 12bda72f 0c88d4a2 f2dcd8db 144c41ed 0178364d 037016b1 8f79d491 0431f9a1 825e9628 b2dbc8f5 2172ecbf c3dd7664 14599f55 0f18c6e8 275eed9f a7b7521f 37283c44 1b0c0bc6 ad359006 716a4ea6 f094f1f8 8e19e19b bd00492d b7f7387a 3fd66e4b d56635e4 458a9cd2 c662d5e1 e718fd63 bc619130 6e9e3179 8df2db63 7dca56ba fcb21e91 77a64eb2 487b564c dbace3d0 6dc7734d dcc6e44a 73f5c353 9b22402c 3ddf3244 c2f5a2ee 79705c43 780327f8 f2f85b98 363e6fd0 52c78bcf 896b6857 e521dfc5 6e5ca227 fb7aca97 f5c7326a c13e1e01 ec532778 bbd46940 3f783538 6aad6180 d2d9ef87 6fcb2d37 f3b70b13 a5a9a8fc 1de59474 62169066 e7c66953 e804464e eb3bf342 de2ce438 d24f0f9c ad763f2b 05674fb6 86df2f7e 412a16fa 6b1d1811 0326d6d4 2d179af9 920424d2 8fb76c4e 64aba6d2 bf3a9fd9 4a09cefb dcc39ec7 4d7f3880 be83eaf5 0e3fc6e0 93e64b74 8a1384d4 787f3309 abac5121 866e9006 f3c70c94 67d3b016 10a98c4c 637c89cb 2f4f270f 1296e603 272b1bea b146ab09 b811cdd7 c48b44df 0f3bae15 e2a84cd3 21815ca1 1f9afc40 a6bf720a 304eb50e 5bc02e3f 07506a26 65f153c3 5d93d540 c7b77d9e 10747082 8d889f6a ebf4a70d 0c925867 2a571a1c 4c37b0d6 ed7b1a6c 0dedd3bb 205085b2 1a4be989 9b2c4b6c e6cf1750 88f24051 2df06bf6 53fc8b47 0b4bb14e aff31703 73f8e800 d78caf91 6556aec7 0b033975 1be4e20d 21aa192e a3936387 c837d830 8f529948 1eb035a2 b4e9da53 34cd27a1 ccd3c8e2 60b87500 36cde921 b5aaa80c 6fbc0919 184aff72 e02fa8f7 11da5bc0 c63a1f94 6638477f 13375894 ab4b89de cb27843f 28dd2c6b 64f6b24b 85736ae7 a1041dea 7630e97d a4dd69e4 967c1fd2 c03d3b7d 7d4e034c f49c74a9 56d04574 e0398c70 313902fa a06b7d26 114c4acb 2d89c71a aff992c5 f7932318 d3d1cb04 3f239025 544a28f4 b7fcc7a8 aefce04c c70386fa a45fc455 b1f7198a 58845eef 96348421 f1df9e59 6732d335 059cb4b3 6532736e 3c8828c3 b9d15752 0917247e ec95f5d5 8720f4bc b55e75a5 6a1e3945 d94f166b 4d0d51ab 36e6f1d4 21232576 177e4748 0c302c86 5e48c81e 0006ce5d 2c0fe297 2e34b752 73a1e199 466c7dff 0c976f34 7aab3e5c a26a1d90 5594556b bd1d50c5 71dee035 340e6516 1c0a95d9 dbf2b519 b3a920ca 4dfdde9b f2ed81a2 ca6285c6 5320ccfe 4382e5ae e668d640 adacbeff edf9e034 4c3d598f 96e74d24 c90a257c 6013140e 2d55bd88 982f6643 1ea39a06 1e850927 6ba43ab3 35983122 0b5293e8 ba4e3fce 65fcd362 712fc9cb cea5ff52 4f65d77f 2826e783 021a8439 a2d0b34f 44525c08 7b6b0786 98125b34 55761d4c bd5e58c4 0ea9180b 4b445ce3 6e9ef0e0 4b270862 c97f5c06 1362ec3a 664227cf 2622ea9e 58a619ec 8a384e9b 196c7488 19ab923e e385d41b 0794e884 e1e807d4 0dc43e84 377e3d17 87ac3c92 94b76781 67452967 5689148e 51f09bc7 b50bb1fa 24e461e2 5f5c9e84 7548c5bb efef51fe ba10c43e 4b99827a e20664e8 136d3bd1 a321864a 4d0e3e92 34cd5a35 7973409c 5fa99748 e94a53f4 3d3b8a94 2a17ac35 316cc5f4 129d201d ceb29817 9a906ff0 7c68acff 2aaa44f0 2b47b7d3 9c5bfa3f 0518cde7 0a388234 4dd6fb4e b0c6e523 fc52a8de cfa5e035 15b9b40a 7917098e 5f684bcd 5e290234 ff7778db 863e1d86 d5790b83 d0bebcc7 56de269c 25ab6a6b 3b3d5cd8 684458d0 b744a1b2 50b66c94 f2151b69 068182b7 e069f739 dadcbfca d0ebada9 28351417 4bcfab01 c1f31da6 38912c31 4427462a 2b351f18 19d976a4 27dd846a 3ce7a092 a121b7dd 569b8e40 343e6abb 313b5687 516b9508 88bed182 c1e20b84 90b2cc9b 07e13b0b e9b5c13f 97751dca 6f8ccaf8 f24594e7 6b91a079 627e52eb 52fd09e1 fab1289b 5560965f 2e29b946 1be19353 b1ee51da 3a9a3015 5f0f0d22 836d60f9 e4acf81a 091c345e 7d75ff4a cac4b0df 65dd9780 a972348e 9434560c 9687ed58 8ae51548 96c7a4a0 1ae594be c9ca9bdd a8c02116 3b0a4ae2 3fcfcfa5 482cd455 3a756cbb 833a86cc 54cd9834 12552536 7081e7f6 f0437340 4ebec9d0 0311a1c3 f62ef1e0 701a5e03 65022fe2 09d66c74 5857dda5 489a2ccd a891877a 82a1da87 2c8251ca cc8ae6b5 b76a6ea3 6e8673ed b17db9b6 cac9dc5a 2c3d8e8f 622062a3 6aa3d552 3f67de86 3a238a3a c6ce3c60 a0a5afb3 719f65d9 43e1d4d3 0659c57e 3f927ed8 7aa26728 38c22ede 7c1aaa5c 1cec6a02 4577f05b 0380d319 19839c6a 88e9a4d5 19df0e2c 71e84d43 6fd3f3e5 e614a65c 794aa0aa c9607db7 74a97240 8695fbc8 bd1a44b5 f7774783 548eb311 85ea324f 7524d641 e5bf597b 3c78b848 8b0fafc5 4208fd4a eabacda7 6287f08e 9952506d 75bba905 2071f767 78180a10 d75ff932 ca94ba72 53b57265 2824fb39 5502a80d 7e47730d 82f03eff 22632732 7e6dcc59 88fb8a34 39a45f7c e1917db4 e249f0ad 606f96fc 3759a505 cca4e160 e46b275a 8c78bb34 bba73134 eaf9a393 892aee4a 9c7049d3 ba3bdb33 f02dd167 dd13b0be 9c991bc1 a8a3e2ce faa60535 132b5188 135a38a9 9614de7c 098c993d 9ed5b0e5 3f0d00b5 c2bb24dd 94a58f82 4f1fc6c3 cde26eff 4a8979d4 50c605db 1d2c79e4 48ffa1a9 1cfc909c 2d56f8b2 3db95a78 aa89a63f 4130de93 140997af 89767cac 9e05e1db 0ea2e623 b077f4ec b310f5db 5468da47 72770d88 5fb4da86 39cb86ed 76688bb7 119c1ca1 7cc363f1 cff27dae 52e5fc8e bdc5ab1e 6b3cef75 ec8adfe0 867aae40 1c0a4f4e cc7ac1c7 d6b12224 8f4f00d6 a72556ca e48110de cae660af 573e078d 7adcbf35 5e059274 624b7f36 ede53a01 5fe8c9f0 4b421558 505b7a86 837241de 9036a692 2661c4ec 236bc73d fc1ae2f6 6f80e0e6 e1a399f4 b7f367f0 04cfa0f3 6caf3b64 0e40914b f6acbaa5 250d88d4 46c1bc75 3aa76217 e2335271 cb500754 fcac84ea 98646531 fcb2a88b 72a595a2 a5b54d2d 85358d04 f67071be b7f3e6d2 3247ce02 623d6f6c d3cdcc2b e72bba43 2b21fb44 ca33ee2e 088bc032 1a196450 709f1d28 3a288792 26734e53 0bed2250 3811af71 ebfaa673 fc5124de 9caf27d5 5a938b13 f6a32c98 9baed745 32f399e8 7d0b2d46 e8f694a9 48ec4c4c 3d70d20e f2cb3809 9be45f1e 87f3722e 578bd6c8 8f1c8ad5 7e6436fd 92e62d75 91e3d49f 5eb2d29e 102b4e0a c72f9808 bfdb6d49 e2baab60 1ebd4159 1183e0ef 572bff58 2b8b1b7a 22b23a7b 1d70b854 c8f5f2e9 5fda4b80 630d2da8 37ce4b86 73986416 08f2889b 861f0f19 6aa142aa 696d28cc a7bd3004 b63eea3e c6a7a4b8 8c7db319 15225244 f83c5598 1d979e2a 637c2a91 8070ef31 16f07d74 33714f4f 8d5690e9 aa2312e3 4c338262 300220db b51da1a1 aa572eca 04e8b12f c041986b d570e484 f66a5086 903c72db 65feebaf 7ad2fe23 9de6d989 f4b3a774 f1d7b66b 77c8278d dcea2921 66153ef8 e26dad7a aac462cf 3e41a303 8dc5b0f5 857b481a 79a32e3c f021d2d4 9c681ef4 a191c9b0 c2d881c4 fff32bb7 f73d47b0 157bc5c6 b05c49d9 d1c10dfb b9c8cc73 fa7c97e0 6e1075ea 5a901143 e2fd352d 8a602128 b75950f3 2ad6ef32 e28b2d6c 86989d40 fa19f5df bfe91a18 3b2d11f5 b65d312d 4e263d24 756553c4 0485643c bbf37e34 67627003 6aa0e7ac 77eb91c1 217946cb cfaabb66 a6b17e22 87e42064 f06d8ba7 11e2db56 87d50b34 3ddae103 fd7c24f4 3d898af0 181fc041 d85af533 c8ece14c 8ffbd0b1 fa842820 38684730 24c69edb a0a2d402 8dacaf0f bffddf95 5d9ae82a c2b7014a 5b32e2d4 ef5b66a4 5548f205 4fe7d389 52dff50d 607ef6da 530e6235 b9aed37b 72f4ba53 2bd785a0 70531571 9f1c2034 c3e654de 5c486306 ffb77865 d205deac 8d2f81f6 ffda2dda 468bf293 2253728f 8821f14e 07b804c3 9d970f4a b46c91e1 b7ae5aa1 4cf49a29 4bfd3351 7c77a997 8e631de1 fafae98f b37016bc 82a5bdd8 03773ef9 1d492815 d2d4b70f 1ed84716 0347c310 0a81e031 ddee709c d3278f04 2bd51467 aa3387f1 0942e95f 7226c15f c551da10 4caa90e8 478ea48b d8b1767c 0a897988 338d03b0 d6a307cd 7edf3828 64a67ca7 64153b80 88061af9 38cb174a ddbe50c3 f92cb62c b6a3136d fa2ecddf 6a627958 cc9a2f63 f2c78095 5086eefc 5a6824c8 a3eeae57 bf0fc09b 4a921017 966fe1ec 2d7fdd8d 42c1c010 a98064c7 b3fcbae3 97436881 254ee0c1 0e577bea da6ccbc8 bdca5838 5c63044c 313e1b58 43f65fb4 de5d15bc 5e970be9 7f5d1b54 8de59d1f ce31b586 77bf0206 5ac180a6 f60b896b 2b1f17fc 96bbcc0f eb499f69 85e61c7d f10a12f5 440715b2 8b8ccf68 6e094d09 4eea5312 c8d9fd5e 26c6b301 b8776c33 d25211e4 47857a64 76f084be d26abc67 cb12752d 3bc0ee5f 2b9c1612 23064636 7e015463 37d22e46 f54d7b2c a3bf10e4 88f64451 43355042 2f8ca7e9 0953b53e 4d525a08 14982ba8 6771bec4 55ce7d7a ac8f1de6 9645c46e f334fefe 4b37925b ffadb0b3 f93211e1 261ad2b2 135b6b9c 3d1ccaa9 4b3b856e 1349aaa9 0fd7867d c6e88d83 32ddd3a5 d6b65b15 e1be0501 5fed4665 048d8526 8c0a8fce 2fa5fb55 fe1d197a 9b47319d c3ed9fd5 17d6e4e7 ab22552d feea4e71 476656de 1f612db3 882bd7ea 991c3147 fc99ad34 c393438d 3d7bc697 fe2e22d2 cef20076 f7f69c2b 7d4e5add 5cc3e976 86733043 f6faad9a 12a33a28 b49ecdf5 4959a356 c3d0827f b822afda adef962d 2e2a71e2 39fdd951 94a41a75 b92e9f99 34eb1173 d26216eb 1d0e1258 6d6256ec f97561be c8d859d7 7a635554 de1b00b8 69ac038f f39583b9 da3cfe69 fa423ae0 b180ba89 79d9c1e5 b16a2594 2d615d53 11ed4859 1c0d271a da061bd0 56651f8b 2b3a2fb8 79bfbe7e ad4fa6a7 ba7421a8 9f23c73a 94c10ad9 ad66b5cb 75fe1890 52168c88 2f032968 51fb8724 5d86b48e b5640905 c8b67cc2 ea1ec91b 82ae72f2 2599dc1f 0eb6a2f4 a39a61d7 ed298b3d cc2e79e4 22e05283 cc67a5ff 14fc2911 59243b74 8aedcd67 7f9157d1 1e527154 6c1dbbc0 fec72a00 8cdda49c 3b52171a 4645f22c 4ca0ec72 1c78a855 c95f6e35 dfda7a47 4ea69767 8615ebdb 1a3fa878 e2bf3f11 7aed2dde bae737d3 6d12b0b1 110a3ff4 bd180dae c220bd30 980a89a1 095ddc10 1a252a4b b02dc17a 2bf42bb3 cf1357c7 cef2b2a8 c09e9c0e 41015ca8 76b83092 91997400 06f3e079 b2879443 33a7ade0 a997c6d7 c82dce97 ed19e3cb ec46b171 255c0107 561b463a 9c0ce9e8 151fa4a8 73321beb f3a54ad4 ce9754bb bb4f956c ae4b1f7f c3d5f6b3 841b2fef 3e91553d ae5159c2 ec9e7ff9 8aca7bc9 fe48ddfd 4c110343 2aada291 787a0144 f3a24966 455a1f9b f360e829 3b650a57 ea0293b9 27a01d1f e0a4a331 2900424a 25e93dfb 60612765 a99c9dbb ee062b7c b7b7c952 27e99653 1c758df9 7eafb6ab a6ced516 f016c766 79ce2454 6a96e91e f3204079 0da38758 8b34525a 96f5ddf3 33ac4ea8 e7878bc8 e2ccdfb2 8d67041c 32eca865 8f540a74 c97a389f 90dc8c11 ea1bf8b8 1b86e224 61de5c5f 613d10fc a7587314 f0b07f88 1bf02814 709dab62 372e41c1 89137528 ead455df 31d6505d 8542a2e8 7475c0d6 1e456260 1e26eec8 c3d8a818 ce22ba5d 8002ec32 9ad20e80 1918cdad 2821f2de 4a1542b5 86a27c13 de019578 99675cef 20513f5e 5227edae 7177e0e9 09fed16b ce0d6740 55a81eb2 6ef5381f 0c5eebef 14ed45bb 9f3dd2ba 8e4183c5 fbe2e632 bede8c2a 3c5d4f13 c82bd1ba eed4dd55 1bb22aa4 a8bfea32 720e3a34 c7c540f9 7ca18301 0739d6d1 4108ec3a e5d7167d cbfb7b09 afe096c8 b0181b33 7134ff67 ce3f1033 c8c1f79b 66eda601 1bdcb237 22fc747b b10b6b32 8e6d65ff 7a9b19ba 70e6406e 74f85e62 4df51978 595f6fd1 aa889f1c 1595cb96 a271ddc8 901bfdde 299cf228 91be203a 92b03cb9 aa32c635 d767b00e 693ab386 75a8d616 dc9b6b49 12f45377 8efda6db 0f883976 8f00d5d0 3f309651 cfd7504d aa0b7a78 7d265a82 c381860c 0be07c8c ea673707 9421a783 6f95468c e75d2c8a 5d517f1e 4f12432f 87610efa ae21f609 2f67cdd0 5db79bcf 8f76ed31 3b939b8e 2622af3c 24f5ea44 c0878c50 507ffbde 93eddaba 84394d3b 8b9d63af 0beb7cb1 15ae967a f21c0d97 41c376d1 e7698808 07e78eac 6d96ecff c4d071a3 3880c262 2a82e201 3de2dac7 ac7acf8d b87b9af7 70ee804c 642d1aa9 acd2f31b 68914b60 d3ed2ead 5905b387 8d10f6ad eedb9e0f d97f3b62 0e9b1b2d a40e8295 2c7d1b95 57befb1a f25769ae 15107eb5 39e133a1 12672b59 8cf570ef 30d9fcbb 43364695 7a550220 9d8b23bc f230fc20 49cfe996 b6e241a5 bbca4d74 35e265d7 aa8d175f 399a030a 3b92f2eb 2077f04f 801e0c1d 15c9f2a7 f713ee48 2a82a964 89e8a6fa 39ff8be0 c3a961cc 5e93532f 599a01d3 cd684885 35eab4ab e0f85331 b0e4cc4f 4691f67a 1b460d6b 53185594 ae7ca704 189887a9 904d3111 a5fef54f b78015f2 bce69bc8 be229abf 12ff7b77 d11861a7 55d31895 0d3b3b49 839108c1 dfc235bc 2e6c2335 41c6493c b5d46d6c 4e388180 2be7a50d bf32debd 33024ab5 2b80f798 cff5e9d7 6ad2068c 09dc1605 758b446c 91ca5500 e7a5f686 e14e1b09 3a0c4a7b 8bde3d3f bae5b719 99c49070 d1d6cda1 8c8e0d5d 63ec56c9 f7396441 932df8ca 1d92379b 2d018d41 e30cd743 d8c08c86 795576b8 5be72267 dd1e13b8 1808013d 131c4c60 53c69280 2fc3c371 0ed63290 2bd9ba8b 4038947d 8604d78b 6e52b4a9 a5331df7 a1a28527 2fb1e000 1df38c36 db6d3522 fd1fd5df 63e4db3b 44f46298 6400bf65 3d9bdd8e ee9dfa92 29b25b1d 1ec77e94 53014ce0 eb7d29c1 c0ba9576 ed11acb6 45e77675 eb4774bb 6db5cfaf fa2388c2 09dd82f3 038b6e73 1c512f00 28f42881 1b8e47f1 cd377613 7a483132 c2487bca cc6caa4b 4ce492b4 249e2550 fcb1cd92 acf97890 a2611a0f 52f7542a aac17fd2 a54f88da d92fe9a8 26fd4743 9f5bf325 c42d7c2f cc7ad9eb 2830b654 d617c19f adeb0d8a 8cc5abce 8e73b39b 34062db5 0a463c29 95263bf3 bae2f6f0 022bbee7 8c0f118c 1ae0efc3 e44447ab 503693ff 1ca98264 91e9ace9 f96770d8 f52d522e 7e4f8f2a 84408116 9d0fcb64 79702060 b079cfce feefed8c ba2b58f0 fe8edb88 e537fdf5 a6442642 50b09c69 894c09c6 b8ffb45a 98fd64e9 cdce1def eaebb14d 292044c1 db9b0610 99923809 0160a214 0352c1da fa5617b1 d501acb8 cac49e8e dbf1b83b 49a46c1f 8803a025 afe58df5 4b97f0d5 48243af3 1e458fa0 a3c6914b b26490b9 e20e41ff 7ad1e85f cf9c31fa 15fb6f04 18a3dc80 daeb8da6 5413f765 1bf6a760 47af2884 16210d76 4b827725 5d36abe7 59e18457 2a5b7125 1757f2cf f9ceb6a8 3471d252 c35eca04 defc095a 476fd6c3 cb00a372 3bd83d6d 3ccecdb2 080ad98e fc14e0da f7d23534 3d05604d 995b94c1 bba2a882 cc5d5b4e 1f2d55d1 12dd1b0f 93158c13 f8db475a 456e3db1 4055f026 2cbbd731 66e4f032 5f6d11ab defac29e c4cb025c 97a51bef d1f51123 d8ab82c3 65af2cf0 9d355a56 47447c38 691f3d49 173d99a5 f83ab5e8 ad9d8abc e3218c96 bb5a9106 f97c5916 356f681e 646cbfa0 161e5f4c a2af79c4 49014fa0 d39fd49c d6746636 7a878dc8 1e73b9ff ba955b95 9487a23d eb424fa0 19e38492 447ac492 1cfc1a64 0e0f00b8 4b345a4b 299ad9e6 5d6ca68a 465be03d c4fbfef3 c0ef1c00 ca0c07b2 6fc3ae4f 4f7f6892 c05788b0 f620d21b a957d7cd 0b5d20a5 be13458a 620f57c5 360ea2e4 27cbf287 33e7a7e7 ae4843eb 003733f7 8e78c88a 88453f05 1bbdc480 ed7cc43b 1561ca8a e83603e4 6ac1b3db fe3016c4 eb314f7b 5e75f56e b9f7ce71 2f6b08ca 7e802903 2b7f21a5 50d1ca6d a0edef59 e93dd209 b5782e68 bf5cf550 e4362579 cefdb018 4df2f75c 5c7ce3d2 184f42e3 126c4677 c8cf1aef 2b1bc0f8 83c69371 de0d39a1 3335f920 f1e7fef2 229b14c7 7d48ec95 54ad847f dafa6372 b8293586 cbf30849 7c90d892 e1f83875 929c17a5 ec6eb988 850e18a8 cc9b63fb 5ea25d16 a278f423 46d97be1 b46586d8 d7f08123 1ce33561 3cca69e4 5d422c51 e8e56af6 f4705981 990f99f6 bb2cd0fd ee783b3c 63cce651 c97e866b a1caaeaf 6285f645 87fd937c ba840682 b537efd5 a2b4538a a6e43891 8e4025a9 5bdf84af 8d9b6805 f1012d52 342e3101 05388645 3d5b91b1 ce2104cf 83f8696a a26f18c5 96702822 0ef22cbe f6b0ae49 cc18d0b4 cfe0d9c6 10ca07d2 ac674681 ad7442d9 483de2ce 802aaaf7 fe16c09c 91a19954 892b62db 7895ea07 47d7cb42 4cc5b381 584288d3 c3eae645 e76346ce 7e8ee7df dfe80a1e 7c7dbc86 86d70be1 cfea4573 36b4ec3e e7b0cf36 1747a0e0 c2008983 f3ebe281 ce7e31b9 f78460cc 29b01bf9 32b6e61f 98977dc4 ce8efeed 2ecb0383 0ee3f9c6 4430866f 34d65e21 70667201 623ddc01 cadc16c0 538a2a13 2368981c 8b3a18bf d4de44c7 968bff95 5744e6a1 747806de 560f97b5 3e93c5bf c46fa0e8 2beedb24 59a2a061 7ff83af2 030dd3f5 cf735e4d d90a8dc8 441c600a aba4fd62 3f4b89b2 6ec3d9a8 e599ddd6 048fbe90 f347a86d f47b889a 8aff4052 d36a7488 2c449909 e7164fc2 27361181 9091488d b897500e b9395ce6 5de2a472 b739af39 c0013a82 0310d35d 7c08077f c9ecc33d 320599ae 2ae058f6 44b03e49 284a44f4 124fc307 22da52c3 13c62f08 1b026343 332af19b d06f92d5 37be810e 41302307 64e70ac6 d6a45093 bdb218c1 0709fbe0 3e614700 e3a85cd2 aa1673bb 7b7b5bcb 5db7a016 43a68fa4 c9ef91a5 9d724bcc 5e1043e0 8f652992 56ffa886 9b9f8d13 a7e799dd 7e1610e9 30a7c18c 2249f395 27f75bbd 61a1bba5 7028119c 9c0a18ce ee5c39e5 80eeccf8 41ebc6d8 850ea614 c91b0126 7de81ded 0392c12e b55a43e3 8d4638fc 2df04753 c8471cbd 7eafdead 94c417b3 b069f46b d1dc5363 bf8c1f4f 2b00961b 9c4481d7 e22ac980 9e8ef2fc 6d32639e 2707413b 7acd2f8f 4cd4fbf5 089309a7 0f04c57b 3e13120e cc824075 e22c04f0 12bb6006 d54e6c18 c60ec62f b46151fa c05122bf ce09be74 aa1033eb 90a07ffc 5d7402d4 82574de6 a5de9ba7 7ae2e732 5e5d2bfe 99fb150a 7e02d96a 59069f33 c623975b caa82695 09d179a8 f1bf1449 c0426bc8 77e96d1b c2b96465 c75c4e20 f69ffd60 4dc495be c08d210a 085864c8 ba3e12fb 4a43a9b6 fe3fa12b 1229ab31 51f2913c 1b56682e 6974da92 9a047835 d9b81ffc 780c3ff8 8dd7343e 21fa7c78 38eae325 6fe5f387 c8a8f69e 0bcdd9c7 ea280596 19e83b15 881a7559 66d1b0f5 54766db6 6b185189 57741517 bafa0c61 3ad6d780 5bc10936 815bd072 1bbc4503 04c6787b 821e823e 7f01f779 75931ca9 8ecff156 8bd3dda5 4b4081a3 a20f1710 67ee394e 4d2da3ef 49786309 b8dbe16e 773d58d8 89af3d58 9771be65 921b0c16 8332c488 ae990556 2b9f5468 1aff6b8b 9629ad6e 224959a1 c276ae7b 7e829ed9 cf44395c 39ba3dba 5621b829 90eabd2a 592e89c4 7f3bbb50 acef00d0 3b40d8c3 203b1ec4 e01604c2 41c7e868 4eba91f0 f2641dac c652aa3c a5ba5bbe e056dd23 eb4581a9 51a530be dcaba552 45d2d399 45e6b8a2 db62c97a 86dffec2 64a5da16 5381dec9 db0e89c8 270c28d8 3d092e2e a20e36e0 9bc87b0a 4ebc6e1d b52747c7 0325ddfa 587383ce a141dfc4 4b5ffccd 70fb406e b1fc1661 28881bc4 00f0840b bfdc758a f939d8b9 cf6c606e 2af8cd22 1af61962 a910f00e 0a27f570 783fe7ee 85d2ce70 dae08fb5 88e0dff4 f1a53fd4 d3d468df 019c6f7b 4bb07a7a 248877df 8fbe648f b8983d18 a797d9cd 3d5a3467 687bab13 92e3cdd6 a145d983 4885889a 96b5603c 960b9077 c9cf9fda 344c2149 684122fe a9858989 7917139a b0d141b6 29c7a8d2 ed88b189 0d1cf11f b23e5fb2 4d9e5de9 7ea99a4c 92995164 5ec3ecee 254e0db8 a19ad586 ce0a61ff 786e11db 0619b3af 40ebbfcb 5519cc50 43dc4329 a285503a c7345598 789098bc 316b5724 95e16fad 512b9b17 c38cff2d ab6927ac 91d40257 33e4e9b6 bd3eab4f 8dedac49 8bc74742 30d2dcb3 0ef34f18 50e4fac0 75c11070 fefb0003 a5a74545 82165c74 05960131 1ab84824 564a172a 953d56cc 3af2780b d20d719a abe636ff 8f7b2337 177f3801 5a10f0fe d5773bcb 09803eb8 ce9cb8ca d3d61e53 84a71a48 7201ec1d 1c8122bb 04718187 6f8df310 2e2d445e 04ca204a 375a7c38 b93860f9 76334250 d8730c05 b32342f8 ed650617 6e6988d4 e95f27c9 de7c6a16 9af8693c 3322b99a 7d928592 260fdda9 1d2750bc ffc9191c eb557ff1 6692d9bb 9251b04e 86f5cbe1 09db9eac fecbaeb6 cedd4312 eb276542 2a108503 ceb08ac0 e563b168 9f4f715e 9c9fe688 a0a1631a 61a056bc e4914549 62c8d1b5 64a3dd16 c06784bb 7194493b c77efa82 2af0c457 66b3e717 bf05e054 b47f53cf b7e355e9 5f189518 232f5b17 7b0e1e0e 1a65940c d3442de9 497c924e 3666e52e b6d275bd dfdfed73 6b22b03c afaf7988 179f2bba 88d6e735 1715524b 8e6b076e f9d168e0 71f2bdea 9ae5141b b8a4a1a4 d06ea0b8 8147c723 7562b1f2 0b90d6fc 4a95960e 51fe8a4a 5ba8f0d7 02be2020 14e80edf 1a753331 2e586a8f c05714e2 414e9e06 7ac0e48c 320515c0 db5cbda9 be84ea72 06a82a2d 4fb59d51 a14e61a9 ff23398e 5bc1814e b0343514 776c6d54 f0474d2c a512474c 758f7188 8f6dbe3d 0c2f4b89 82edc3f4 7e0f5360 62fba767 576fcc63 6d18f35c a6ad75ae 8c2185e1 65f97d7f 88bc38b8 5f86fc99 9253bc43 5c2c544c 795ca187 11d7b265 af2a3562 7c238d51 fd93ea04 da4976c9 6c122246 37bb35ef f9f3f609 eecb9249 43027277 6c9b79e2 e8b4aa48 04c9752f 464283f6 e25e8e09 41d63e68 44abfcdc f32aaeaf e2cd954d 7e278fea 91cbffb5 d0b563e7 fabb476f 0cbf3a66 ecf316df 556106f6 407fc98a 84935936 1dfcfc13 61a6344c 57713974 04a23e44 52f66adc 51c95b20 8dcbc762 3354fc10 d58b4566 5f27d78c 625f8795 48de9639 66a22fcf f3a43dbf 147a54a7 961ff5df 3b2774a2 b1d49d8e cdfc8074 bcae55d3 dff688e7 e989fad0 034c4f70 97a44299 221cb35c d26812d7 07cfb1dd 898e0273 f5ed3517 d6a5734c 798e6b7e e34894aa 13c59ef1 f8c83a50 4b824ea4 7a71992c 7c9d4e80 1d03637c 1064cf50 011212d3 7b53bf9c c2fed859 a5b2a176 b1883528 aa45d54b 9dabfaee 0cdee8c0 a6bf17e1 9f3d32db 8fb0d633 19443c9c 826bb012 a6eb110a c02186b9 358db0a0 6f3f4e50 de3d9240 da57058d 1cec9394 c7150cec 6c02a700 5664af35 80d28646 8b1748e1 de4f2703 c4388ea3 6f57fa78 be17e3ef f627c33f 90484b08 6b173653 08b6aa45 9eae4ccc 4248f88f 1fe433e6 3e06f09d 2b8c3f70 8a5d4370 0cd6fb29 bf6ff01c c774c12b f78b0e9e 7f7110ca aa6334d5 cfbaebbf c8e2dec6 86cbedf8 1e77c7f1 6b9b0b1f ec1f43ff 33d6e5a3 9cd2e8fa 05d80365 530cafd4 d2ee5e6d 9019fcfc c59d345a aa163f80 ae7591b0 3dc5a125 6419c2f9 016641b8 417313ab 82343f7a e3e44483 09cfe223 1e286a55 eb90c44f 8daf129b 1a5f185c bf020abf ea31a5ed 67f215ff 9f0adf08 122fed85 7f9b5b1a 6a5ca266 0f72fe6e 2bcd5315 ab753dd1 eb819093 db84a7dc 9e643b59 e6f908a5 857ff6ba 40538997 b6414d87 e46bf753 baeea652 caef5475 b82be90a 96406439 092601bf 220fb678 b897eb7a 23d40316 22dd43c7 57bf4950 f7c28de0 0ab52dee cb8c6d61 d0d54f78 3073527d c41d8c26 cf0f22da 95b010d9 76967517 b43da66e 7980d897 f3f3d0a2 ddb47a50 2c590637 52f17d4e 69bf7c50 c9a53d22 714f0bbb 20bc370d d7632453 1053e3a9 0cbb6c90 ce3bcb20 11e236f1 e51bc7ab 74380493 4331af54 1bbe9fda afcff2dd 3ebf9c9c 45cccff4 61b9f1df bb857b6b f84d36be b237f803 6c366d4e 9ae03009 43e2d263 03012b0f 8b544563 ffa37d25 4a729186 e2955691 b3b5fcb1 4532397e b534f20b 6d2fb6fc 0988ff72 c5efb7b2 33efa688 66c9d22a 0d6114d1 116f9319 3ca5df0f 190c96a6 7627672f bbacdaf1 b370e9f2 8e7158fa 45f2dcb4 ff247685 036d4709 1505e938 4394e28c f75f099b 52d7664e eacf9a2e 200d29bf f9b082b9 3805d7af 87f25a4f 396a73e1 05bf45d1 7a2456d5 203c6f50 7342615f 414ebfba 3fb53c59 893f7449 a4f1ef48 db59da36 14bad947 ff1f4141 2ae119ff 90e339e4 fa9dad41 1f98e6aa 1dfb40db ae3a9f4c 6dd7659f b2ff2242 c659a670 e6cefd12 fea3140c 30ccb9e9 d1a8c5d4 664804e7 c71d4973 94d924e7 effa5e17 302809cb 677f283d e6466ddd 38222422 0d191ae4 8d25ec8e 9c037dd1 4f6730a7 5db58980 944b7546 0b64e045 a15e42e7 d9b3c784 ace09d10 7ab1efb9 05faf0ed 9ea64210 b3d6364a 072bed59 e20db814 ff241e90 cc6b6765 7b96701f 51c080c5 821a3217 29aeb517 439d09b1 09255e56 e258e957 b47f67cb 0a48ad9f 2d0a9fd8 1af13ca6 fff07350 8a8ee32b f79be740 0270baf5 67dcb47f a0c81a56 864b8493 4f8b90be 576a7d44 908f05dc d918cfb6 fbd7c8ee dbd503e0 3678841f 630199a9 3e09c6d3 0902dccd 7f4a928d 5e60a502 2df10751 7d2e9a9a f4bda679 1fb83564 1c1eb20f e75e165a 8615bc10 d94bf18b 798a4370 57f595c6 8de196a1 5f813fe5 9b669317 5fe1f9ec 7b9b702d 6f429844 c3aee9f4 8792ed29 ce52c0cf 3d2e9989 a80f844c 6d563d03 132c83c7 f2abc58e ad1f767b c9cbc899 af85d50f 5bf8557e 94658a12 497f62e7 0765386a 1165e731 ea4a1fdd 5a0bdc78 342fcfa4 e5014bef 9b3a7bdd b6a39d56 2339ab99 78a85410 71f90e4e 96b8c712 b35e7292 5c774e4a e52ab9e3 aa12a61d 450efaef a347a152 b39924f4 a2ec7bc6 88d68634 ca0129e1 2318f95c 24aff407 71197a12 20ef1047 ee49356f a0ff4097 d30b4762 4dc0d150 29ffb6f9 03bc881e 1a129452 e8843b96 7ccd1c94 3b791842 376cc983 8b97ae78 8f519b3a 18d6bf6c 8c5d580c f07976ce 4813a8bd 5e73653c 9e74d4d2 02e85a79 63b5a559 ec205595 55c2974e 8e7a02c0 fcc610a6 295d7a49 2a870274 f4e94a38 5f1a5abc 8cb3d0fa 10fa1b0a 20275680 50fca784 0ee8a750 1f5109c3 10f51681 0e87d92f 4d59586e 1155fa39 98777a7e 618d0b97 8f30803a f7a6f4fd ef537db5 89382490 1f705625 55c8d9f4 10645496 bfe222e6 6ae2c3de da3562b2 960063de 7304edaa 46017746 c2ad9da1 35dd93bb e00ee9ec f9fd0fcd c8b9b48c 9a5ac13c 0b41df08 c0215402 61a23553 4c61b039 e3f6a7c6 a085c9e8 ecae9127 4587b26d cad7a502 a824b7a0 90bb1a5b 92d5fb84 206f89bb 3e1f7e69 24bfead5 db0c1f86 dec588e2 98e2f36b 27bb8eb2 6d45220e 13e22048 cac74169 59866ebf 9cfba55a 97f2c503 e3cd9baa 5b300849 fae33009 8f80b790 712a91e4 c72f7a4e 6f641c32 00cd516c 3d36e65e 8c40ac6d 77b731ca a6b00c59 3ce72457 043ce573 dbc46054 55f42d50 3e59447d d69bf869 96fae792 a1755c60 ce0a7d41 f0b36e9b a5b3d8e0 220644e1 8670e6df fcbc9a6d 9e6fdf15 7a6e5b1b 0b289f17 7e4203f1 25149c0d d3afa12f 5a674ccb 8eb21262 a5e6ff55 a300202e 1718842d a29ac422 afe07903 6e20c8ad 467c0160 dec75e8a 86bb8c88 3298f3a8 737609fc b3a6e072 e6b02b0c cc6c37eb ba7e06d9 2f71e7aa ea373e3b 64eefae4 6eea8f99 ecfd2d24 3619dfb1 0606df0f 751f4a9b d5630380 55bf1b58 07ce64da d17b1ddb 2676c1ea 1aba7337 3f21dba7 a6f8d405 0d2eb61c 6ff5bb28 e64fd085 b45cbd51 745aa560 18bc5b4c 19f1aaaf e64f121b 1c15ce2e dce6da97 1ee8a97e 4e4b2399 52786848 591da575 30afe885 45658044 8c28fa18 0af849cb b0a3c66d 1d25369a 1e7292da de8c9d09 c1c3393e 5a286184 c36afcad 12ef745a 8d63e35e d2b085f6 4578f363 0278ca78 dd0c8e04 454104df 141a82f0 46aab504 0ee63690 a2ba568f 755b1396 cfdf58a5 e27479ec 82f944f8 dae9bbf8 f68b17cc 8870bdf2 d5a4349a 04208989 b2a2a29c 72465134 040ba4c8 1c270084 f9701090 7e821629 6c605c57 1f202ed4 649ce9b2 0823fc2b 7a12aff0 aed34aa9 a99bdda3 133c3c2d 781ff43f 24628908 e99ec457 7ae735ed 0aac99d3 2e915f32 7015f607 2097cb36 835291ef 5cb9d5de b5d57aee 0bffaa2d 4cf5e9c1 56625ea6 d5f08091 a9b9ac39 a1fa9b4d 512b5622 adb287b4 09103618 3c641a5a 70cb7e12 9cabbe16 8b5c40f8 013518dd 57fca206 8b987278 d1ed567f 4690a919 ef2ae565 03f439b8 87ce66ee 89ea9bc3 4f7d0bf6 f98224b3 fd996d81 22f7aa0a f8897f61 5a28181e a5ec110a fa9fb909 93101962 5841ce91 a10e688d 3219dae8 6cf2d1b6 7bd793bf 83873d06 e600a9db b4a8795d cd54d20e 5c892e1e 913d8bfd 28604c49 044b3bbc dcbd97b6 0ec38b2a e7b166fb 64155341 ffa6bc72 4ac8cb07 ddfff968 3c7fe8f6 a5f8fed9 958eaa62 9737db79 c810dd6a 0c7ca915 0358146c e4953366 0d8e9f1b 0e555a7f 75564727 9c515bca 74e46870 f0e8e891 8262564d 09987e65 a1ae72bb 3b160c20 da8f0637 0a49a817 de0be376 1392d1a6 4bf28d43 b40d0914 83eef961 7cdb2822 60a4cb3d 327d6b1c ab97a40b 32099096 e1566cd1 b9b44397 7a9ac45d bf9c7747 477c7f57 2f68e7fd 09fcdd5e c3b07f3e 180bb2db c71be36f 76c529bc ba19fd07 6a225154 db0b80bf 311c6674 3afe7a52 09ce2375 ca7e2c3d 31b83150 4e5795b4 96000312 f3849796 a10f4ac2 de5a3709 38eea422 c2e5523b a34e9d59 95dae8fb 29dad331 909782b0 c0800ff2 cec2b2c1 d1003d1b e86fd4b3 9a365139 a03d55e2 b467c4eb c635f05f 94c9f52d 1d4b00cb 5b4f1e28 18fa4421 5608461c c625b795 b1612779 d99ab591 e877a1de 8d9b49d4 7738130b b064dd4f 76ed4ec3 a0066c09 b608ba6a 00b886ce 9558a263 f2b1f51d 71de0832 96b47fac 86ecbb25 e9160a04 ae6f2f02 27ab7dbd de2a9391 c4ee6ce7 1837f355 2dd0f67e 433ea968 c1dac268 231a500e cf822ece 68898d26 6ec5f8a0 8727a348 a903da81 c4c63746 b6b74d6f 2c24fb2c b3504af7 527b1add 136e4fb2 123469a7 652d3106 30da45e6 da869011 7bccf1a1 2c2f54cb f25e7200 0e064144 ca7696df de40b2ca 5141528e aecf48d2 7a8b2df4 eccaf1cf 51a87ebe 0261b187 05c451de c918a5e6 1529a339 a21f6d95 1ba57b51 b7e57af2 bd765357 fdc23a27 048b4d5b 91ea3317 50d670a6 e85671c5 0e2d5698 a9198c10 cf1c019b f980c1d0 b2d5780c 4dee10de 1aa87e3c 0bc11de1 76f708b9 21faf79a 60799fcf 45d57fe7 6e1f596c 43a70ba2 c762a146 7301404c 1c696340 d60d0944 1c0ed9ee 5997fce5 0b88fb00 d1210d06 244b8c91 bec83f64 7230ae9e f16b1da6 2deffc2d 5ffee354 031e3a14 1b30c54a d912495d 1afdb20e 796c3149 8f03e2a1 79e3ccba e6bf5051 150e5f19 ae94713c 53bafbfd 12c9a9bf 02625205 9787fb40 a2f1ece2 b2558b74 fec32bd0 3dd27579 8b316e10 3607d2f7 86a421c4 349a4155 b9929bc4 5752b977 7aed7d5c a8b35647 2bdc6bfe d55bd21e b06bc6ca ae4145fb 3851b4f8 491f89a3 b7281c7e 7b1cf903 f92b15c7 753d21fb 0ca14331 892dd8db 24a81e93 fe54c1e3 f37cb72a 44012ac1 c3349fc0 1ee9c06d 26d20444 e0dfc0b5 e1e019e7 68163c56 2f4dbfa5 62d5d1b4 1e582b3a a9bb1907 8d31cb3a 5996638b a4f1c427 badd7eac abb67882 c6fe34d4 f7d448b6 aaac8ad0 e23cef20 aa763bf8 212f6681 b3153fc3 d18e9dbf 9af93f8f 27db774d 4fb12065 99dcffe4 2d3a36b0 38916a9c 2f8fb677 454ace8b ac4923a9 8bbc2700 c6d103c0 41678ccf a78103ad d339c360 38dd654b ddc03b43 de20c13f ea6cddf9 e06890db aba01ed3 4d7591ea d18b18eb ff7fed02 f6264547 2bec9ba5 d1836068 6d1dba2b d6d56148 19feb7bd aba2357c 094903f9 332cb4f1 e51d9597 a3b0c466 1ed6f61f efc5ec2a 34df918f a79741e9 1743196c b9bf255e 070f2b1b 9ea445eb 12a4ac00 ff753601 f62300cb b9185a17 3d1baa6d fdc493dd 2a5ee5fc 37612b77 413f69b4 ce4711db 9652e566 60896d4f c47ec455 106cc7aa 0e06222b 44b83a0a b2470739 48f52030 19d72f09 7fd914a5 7250a4e7 c0517e1d 29752572 e0718681 55872bf6 f8be30db 1d951bfd cdcfc34b 52723c33 0b75f2ff cb8dd928 ecd4c1a6 2cc081ac 99744354 c7992b0c 529561db 7ac737b5 939a7a79 46581c8a 303e6267 dc510c9c 7a8567ae a30c151e 14ff3779 0320493d 8b4acfca 7e542843 77c15585 b7b0f127 b8e68184 c77b4196 29467488 2bb7a7b0 e43c0cf6 11b38b6a 97d6048b 428fa69d 6d2ddfc0 30642163 af854ddd 64e64f7d a034908d 168bcb31 101238fb a8343f3f 1843c1a8 9a573be4 12696f44 d3f6f54e 2f3ce4f2 fa12a2c4 9a155a38 dd3097a8 9fa77d23 36981a0a 90eea192 b028f18d a2be47de 06075cf6 d0cfb1b0 d30c77bf 9eda88d8 7decbe00 28c16366 fd9a41ba b2ce119f 5c88027f 7fc2369c 051a6d05 275bedb6 3dfcc361 ee618694 0bbb51a8 9362112a 76d79d57 e91e5a2b 8bd47968 db6ba4b1 54f62d64 9d2803ee f16ec52c 754b2419 6a634a18 2fe40668 8cb64dd9 6dd8eb20 3aa71f87 4899d32d 4b21c8f6 48318dad e2026b3d dca02145 64fa669a 12427474 0de6de2d 614c3f61 0e2721ee 99636e33 e45e6d3b 0a67f2c8 7dcfe838 d281e389 99d0eaa7 ee32a2f1 2fda462b 749461c4 421d310b c11ce0f0 70d256e4 ac54f2e7 311ddbcc 58a09b7e c20a036b b93bf039 8d3616ff 25702e12 85d2d76f 16ec011b 5660a6d6 9ff84ba8 fa7dd8a0 84256652 ec6d96a4 c29c3f70 4f73db7c d68c264e 433d0744 9f7b4f6b 0b77cf7a 3669f59d aecfebb4 c4b59e66 3de3cd63 e5024485 413de1e2 8446dd0f bc4ea49f 238ef825 7f472ad9 3c5d0388 dca1c117 0cb3b344 f357510c 7cd7e5b1 cde31736 6140610e 104b41fd 38cd55ae ca00fa80 8f5d74e6 aa2c10a4 fd1d9109 be04d70d 840248d1 c2350df7 00c5fe48 e2ca9e72 05ff98dc 83fc563c 8f251fcb 22c09ee0 1cc45a94 3358c4bb dd12a3cd ff6a5156 fd976398 bdcb947f 5938ca70 2bd8c3b2 08a45391 c779a4f0 e780994a 172ab053 e613f7fe e97972c2 fa5e837e 4a9253e0 769d4ca4 d759ab7f c822084e 591297a2 0a0c71b8 58307d19 6a74ebea eafdc042 95f3204a 571c5520 57240d8f e4138b02 1b8e36f3 334753fd 9eedd7b2 09897768 1517a210 8e3c395b 20208d08 f22b5185 bfe1c74a 3e1b9510 7fb152c4 c5d74cd8 2dbf6b0d 104f1d21 6373b96c 951ac9e0 8780edf9 d94c1836 929d4fae c703b9f9 f695190e 5a6e6f2a 5d09a30c 7d57f928 61fcc80d d2877cb0 1966056d 07fd909a e84de253 aa106e90 b142188a af999c4a 97ef539c 79329f18 98793afe 7455185d 0bcf9c4e 99460273 a22eca39 5aa929a2 b633607e 752a58a5 73e2c9da 7b4f2938 4107457c 853f33fa 9cf2c590 a57a7e08 78755545 e672e1cc 2fcde11b 1e93c5c4 fcffb5e3 73504b0e 01d48f10 c39189cf 7549cc2f 6e1bcab6 01d076c2 3057a3d2 2a250fda 6a50b9c4 39c858c1 e4551392 456146e7 67f699a3 d03539c0 312d3deb 60b88f90 f4e613ca f9dff89f 906481b0 2534194e 3a1f579b 9bf8ab37 e5956ce5 c9daf389 97bc8c6e 11c99a34 6cefcb7d 3428e048 6ee2dc0f 744d677d 3f50d579 66a2b346 8a1bd3f4 72612cf3 cccc99d5 06788bed c849e71f 19cd5c6b 73332b2f 03297c7c 625db988 5b704353 c72d4496 6a617722 f7aab35a 5b802e9b 3df19d04 4718349f 9ac2a0d6 f80e9da8 650fa39f df835f3d afddc349 c4d29178 01eda51d 2cb3747f adf5220a ed111b17 18d824bd 5fd67dba 935a6fcd a54ed9b9 63b33910 72d4ee33 ba336a05 b2626b67 b96a6ecb 1c0ad2da e39cc781 5275a010 d6477574 ced6b1a6 5d804ecb 5b29ff8f aa11c26d a2aecdca cf292ba0 c4845850 98ec3a19 14c63b90 d3e8ad55 4a3f61ec b0536d52 4ce982d6 f0fbc8b5 caa8311d 298b5c44 bbc09567 f43fb1cc c5ee4a75 216f8276 764f4056 897c22c2 94a12225 551bfe7f 39d72bed 05b2ed82 627064bb 052c2f3a 7af23314 7f8db58c 905bff89 64461468 c99cd8ae 53c0d80b 1d3e468e 51cedcf5 2252461f 3af6e6f6 b3cf0a98 36667c97 1e5bb2ec 46354c0d ac3c913d e19d554b 4f302671 79068cd5 21315378 515c6ccc 30ced495 12d29ea5 45f6b121 e47f8d6d 3e08661b 5fb79d11 111c2b2e 1403f663 c004c8e3 ca52403d 11b5c144 433c767f 0d8a46b3 268e373d 0e461bf2 68812d16 892358df 74f58bae ae666c4f bacceed5 43e62f31 bd8f7ed9 77264c70 c4d44bfe ab75d1b5 5ce0d516 ad899297 f06a7b3a 75479c17 7575aed3 f2080092 2949c0c9 b7f5bc1c f8bbc61d 99929d7b 8b6dd379 37a42fee df83f25b f11c65ad e670554a cb8de2b8 bee83d25 0e8e57ea 83521587 e4cbe38e 538fbe81 d18971c2 93991dfd 6b803cdd 36fc32d8 bef661f2 4abb0982 31f5bf69 20a514a0 17c5456f 39d5ef78 8770731e 00ec3832 b58ddec1 5a63c381 3e6611e4 102dcf39 a1634e60 57cb63a5 532d9a6f 4e866bb7 27d9ba49 27974240 46832746 e309436e ad955774 529954fb 7c672a4d a1adb82d fae5f9fe 3476476c 522e325c 9e3c891a 309364fb 6aa65b6e 678cbf40 78832f07 a812f02c 9812b69e a01f8c0e 36aeeeb5 9e00f166 5ebc4441 f5a09199 9f21527a 2ff879e9 39d7a135 2ac6a47a e888f530 1419b22a 5e9865d6 21c35c73 6ebe131e 834f9a45 245b634c bf707b39 09cb1493 948ee72d 090b0071 568bbaa0 95e82c90 86f5d32f 213ad5a8 641edcef fb1c00b7 da7997b5 1c2769ad 9c6d41b0 62214423 efef2eb3 00a9cdb1 b772f4e4 b2ccee64 e56d1683 6f21ddbe a1911b66 f4c5caf2 73781f8f 6f54f50a ca4f604e 30ca5b92 318bded7 f1f0711d af33b977 0e5f83cc 871ca9cf 6efc6b69 7fce8a9a 03bb2426 52e8b70c 905bb9b5 eec73c85 9fc0859e 50486308 9da66eb1 62bd55f6 e769b0b5 25a85723 102cf534 a68c8df0 a2a73fc3 d6d05604 7a49adbc 9c0b23b0 f01bf1e1 afc2abe0 1ebb098c cd27587b 58209ef6 caf93315 93a265d7 8dca2e84 b3231d25 387b94fe df9dc9dc 757055c5 801dc5bf 721468aa ff5d3c44 0fde1c0f 81d34abc 1ab57110 936ebe91 3ece442d 6fa93f0d 9a15d3e0 8b4c2245 65cf45f7 8e9d9bba 99593bca 74de5ddc 2b1d9f5a 59919d9d 5e46ce53 524e59dd 5e9c05d4 1d85dc87 0917817e 9b0fb730 197348d8 6a1dec20 1a854cb4 47bf50b7 fc270e72 199d8b08 d280a1ea f76ae99b beeefdff 58fb7b5b b15263c5 2c90b30b 62dea9da e6184f85 ed475ffd 08e8758c 503bc2d9 b2f3e703 0c085a18 b3b1c2aa 9ee3a0f8 80c9563f 6c8bab8c 913ed7d9 2f0d827a a6b3a7c4 e8635217 fb30da80 308b6d65 c3938462 32e77274 3b00cc71 5d2182bc 9522e318 f57380c7 498140a5 4ad69d57 0c33a2de 2e802a23 fea119d7 559f58bf a6086744 e82a1173 62b198b8 01032db3 dd3be5d0 30a9ca5e c15ab8c7 4fe45796 00072d16 9c9aac6d 716708ec d426a5e6 6468a5df c2db5db8 0a9f9d7a 8a7598b5 265a8df1 a6f49f7f d2a820dd 8eea54cc 2967530f 368cbf4f 3511c747 bdfdf4bb e649b9ec 3a6aa24d dfe0c5b7 d517df57 13bb8010 39e6bec7 9318dd2e 8081cd86 0cdb7bf6 0ba87b69 edf04509 3f731385 43161ca8 8a1c363e 81bbf998 c9b9cf5e 76d76406 d7cf6354 4138abbc 9e8e63ee b332bf90 fcbf7c8a eb38202c 86686cad 6f01b3a1 7edf00b6 502a5eb8 06ac5b3a ad310b66 ddf2ff84 41a32724 5a6fe98c 754656a6 17dbbd48 f26f7394 4f814ad7 bbccbda2 a7fe567c 615599ef 9d1babdd 81bd4e62 b8e10cb0 c0957ae5 056a9144 6564ed09 7269541d b110c071 62310a13 dfa36c50 0062763a 786b07f7 7ca4d160 a0b0a4d8 2abe1af5 ef504902 41f3b212 804ea1bc 2ffcaa24 c645cb77 e2a0c73d c2b0b2e9 e299f9aa 5093d313 1f17824c 8c895ee4 8233617e 618f91d4 868cab64 53140823 095201eb b8d3b2f3 0722e612 33aee2d5 52a18fed 20f040b7 62c1affa 408dfbc5 72eabc06 871e6c7f 0423236b 9dedb858 d7e04b05 9af76966 8e4fe19b c5a8c27b d6b1ba64 9d79ae05 1bcb79d3 ca695b90 9dae132f 61517f67 cc31bcbf 11c550a6 c380943d 391eaef3 96ff13ba b1407fe6 43330c48 2e94d0f7 91a59ef1 abd8561d 375a0009 7405a501 30383d28 427ed983 b28fbb09 96bdf309 accf4e8d 3bae8776 4b37c761 972869e2 248de953 a373c6f4 bd045bc2 b8dc2369 eeed27dd fa7666df 7ddc5c6a 85d524ed 00c320e2 5b34fd68 d45d4ace 2d07d530 2e5fcb60 2c2f930a ebf0c973 ddc57069 b2c029aa 3b7a4d1c 52ab7262 9eddfe9e c8c91568 462a82a2 5db45ad5 62d5ebba 4794da47 f66f3fbe eff74a5e a0931ab7 78b49480 17ed3070 62f2859b 40e97754 8f92566c ba98dbac f4ad5430 271c3062 e8d50ee8 3f9dbfb3 9790766c 5653745d 6f19bf2b 9aaee6c8 a21ffb8c f1386c8f 0cf5579e 2715d51e cf8c235d 98d20567 58de7de0 6ad08d10 499e27fb 902bab7a 0b5656c4 3de21d5f cc9ee396 dc0c97bb 9c0e223e c12cc658 4b491982 e37f6b83 0855dcf9 e8a21c76 2fd9987e 3f6825f8 0fb16d3f 4a36c25b 763c4b07 77c00ddb 14fbb3fb d0c8269d 09d333cd 77d8953b f814e78e 9743850b 29ca01d1 2aa4b13c fb48c8ba fbb15873 7bee5f66 75cc12f9 7e81da61 281ccb9f 17f64366 36f7c3a0 cccabe64 f069fa8a 23ac839b de727380 f9a76c68 76459abb 96a7229d d2790272 612a66c6 9d865084 224c6e10 7d903f68 1a8bfe49 0a05b9ac ed461e55 a70903be cb9c8e51 80ec5720 8a53da87 9e3fc39c 19fbdb6d fce17716 332481a1 1f879d38 3e92b00e ebd76fe5 73617617 9d04fadd fb347e68 a3488a45 0eafcae6 8d8d378e 87681bad 65a0f75f da50cf46 c44599bf 5995179e dbfbb45f 6f682448 f374574a 1fa61107 e04bba2c d21c15a2 0aa41c29 e723b7c4 58befbdd c40e31cb d9c3742f af72232b 427c848c 857d9781 b0ac7a9b 64579cb6 cdbbdb09 5d4c9079 ac53c860 1f1160fd 088f96d7 3968cdfa fedb9c48 62282110 c856171f 1ad91af0 f356bda7 7391d41f 13c4309b cb673901 03f6ef77 b851a50a 36a15a2a 09ad41ae c56975f7 745efd6a 7f4860c6 1176136a fd58d4f9 5a3c007a b3819b89 5749d2f8 5afd9901 4491f7b7 36af5a84 92000788 93c7dd39 048eebd4 a390994a b06fb5cb f6d06447 aee69e13 464d48e9 57255672 fd121a3e 42adc2ca e22fae64 758173d5 5c165cf1 770514c2 53cf7b54 0102d327 60ddcd72 0c37b256 bc38d9b1 95dadd6f 61efa73e 2a17945f b3974e9c e3fecd17 1046d4f1 c9ac3214 1ec7ea7e f4db2c8e 65ba8d21 69eed00b 78bc95c8 daa0ff97 11e1b687 6a825cc9 201ac7b5 abbcada4 654e50eb 432b1119 c4a08773 ff8bd7bf 11b8834b ce716d4e 97673661 62df4fc0 473e4827 1bab624e de9abdad faa017ba 3db50885 ad1e15d2 514aa34c 555409c1 ad7d0bc7 69d20ed8 71ba8af3 63e30523 12d02068 8c6b87c5 bdada0f6 65a3c734 2ef13440 376d87c4 44ad119c f9d2be5d ddfa34bb 73fa2a37 76663727 7fb9ccde ae92d51b f568d9ca df02c1b8 8c9913f6 d2a42263 0a97a939 3ef06e26 f07883af 564e98ad d16afd54 58f87ee4 78901a18 4b80363e 912afde3 70d9d5d5 6ee83383 f97360a2 8f1ee22b 793b0d80 beb3143b a538135b aea7b634 b03d1702 17346a1b 0b818a87 891490fb 11f27776 988b15c0 43d8f980 8ccb266d e47e71f8 371c4b68 bfed868c 22d06c78 6450a7f6 ebf86efd 468f3580 1b4f6999 9db3a4fc c4a149a8 f63d44dd 82e73688 349e1c15 19050ba6 dc2d7de2 56f75c98 9bad245a 48ef294a daf575c5 57cd5223 dd5dae88 f3960677 0a8a7eb1 c95eda50 d1923c31 022f342e 66b93ea5 eee5cba6 f6e39f68 318f2289 3749e8fb 591714ec 495f5e87 d9435154 af207c85 6417f5c5 c0dd12b7 37d97a14 77aa5c2d 1dc4f3fa c3adb1df fe99725d 3b1534ea b2545359 1b80d2c2 86a8698f eb683084 0a0eb638 dfd6615c ced92750 fbb63ac7 58fb2d16 b77963af f011d748 bae40b00 9326abe9 1ae44257 9755b7d4 12cd79e7 cf249d77 06035008 0ed0668f 814521e7 c9a0c704 c44625df c3384a2b d2dcb1de 43026e67 61e06b88 56790f49 a828f112 60982a90 1f491dad 83307ad9 86035e6d 10578813 a98626ab 363ee4b4 6a0dec9a c881c220 602a7b89 1a82eac7 d826030c 90aa6523 26ad5cad d3fc3e01 a584d487 b879dc1d 76c7eac5 1d870c59 454b2797 d5c5bde9 0ab91201 088ad112 f6f46012 31f2d898 8c80f9c9 6e2f9f2d e4a0da36 9eb03185 ba92e65a b055c7d6 58ba6067 0e0bde3e fdfd83df 7695eb11 dee4cfce 1374ab12 c900e9c1 6cd75174 c3ced1f3 bf156fce c91602f3 36a2cc26 af4614c7 9722d6ae bce5df3e d425f607 301ec662 13e6877e b8fecf01 0fb441f7 f3817c48 3f0f0ba2 abf0811b 29a00cc1 5ebd8725 4c0f5b2a 042721cc 3e33e3f0 7ea1a398 060d50cf 78356889 c021abe6 c694b299 82f33914 183c58fd 17b0543d fdf05753 1e1606dc 7ccecea0 b5c13966 c9441761 898717e3 70184bde b0099bfc 8a0e4972 b6c14146 71faf8e4 2aac4875 d1448cfc f5d41d3c adb10927 72e57223 45290b04 aa094487 53c2c636 8c4ad0e4 f02c0ffc cb071bcb 1529ed14 82d77032 a57ffeb9 3fe86642 3b242c25 a0fd8e95 32b21367 e293b391 5dc9125d a13a8a8f 4b031f4a ba853bca 3e661542 73b09bd5 8c996ec3 7a2a8f9e c1cf50e7 82d7f388 76cba6c8 e877694e bcd659fd ed408193 f8d1c58e e7b9eadc 36953e52 fe726682 bc160309 59ba0989 0e0b6999 675c4645 100c7cee 6c8376af ae149f04 4834f2b1 58ed7436 614c59b0 2d215bdf 45c35223 cd64fd75 ed5c511e 56f27d3c 23f2f43d 1900dd8e 107712a1 1b2d0854 69b612dd 03dd603f 19eb66f1 8ddccd77 d367063b e6976b4f 8d051463 a9ab186e 2c71e982 b09e73be 60044d8a 77b3de62 f6ed93e5 369dcd0c 16054d30 f8218596 c28f1bae 54bea7e3 092646e6 3e6d7a0a fcd3540c 08359c3b 5ed9f54e bcc21b51 2db1a99e 3eb4219d 778cd0c8 7aab6d41 e0014c6b f08150a0 7fcfae89 b1ad7034 0132fe8f 64b15ce9 55f49878 8dcdb1d2 4f0e684d 13998188 5f9c8e1e 8664ccb9 9dbb73e4 b2e174a4 9b8f5019 daeac049 2630c2cb a8e5877b 7dc86f70 638a5307 ac0fb9e0 8abd5477 822de411 0c5950b6 8f39d870 47df8e93 5d14a936 3ea09166 ed3e7758 f3447197 1139546e 0a35b3f5 57df69f0 e6a88ccc 7883df2d 29c0f865 181e1049 2fe0fe6a a4f805fc 0e57b90f 0747fb6a 7cb48fbc 62583946 571a39f8 92a86acb 8eeb2af6 53662e5d f14a439a 38455a29 7f70f9e3 52bcc72e 416c1101 8a76f465 b8840881 c979736e ba973ecb 47974c35 72629549 13d21b37 1f57a1ad b585e2c6 51d30043 990a870c 77ee7741 9ac52e10 3eea5194 aee35071 6fd7c6fc ce4d7d5d f8349ec9 ff7f634d bef1ca64 8db774b2 e93c0faf 86e996f1 828c6635 2f876d32 9aa42d77 6cbd887e 95c60de3 77988ee9 3f25f5f9 cb6eb6ea 3dca62ab 12c620be e2c4e959 670847d7 e95a5bc1 17067711 b1c13263 c6108747 81464211 4d2c7de3 0fe28802 864be466 cf88fe44 4b2b96b6 ea054289 6185a0eb 6e761520 f050946c de0e8bb3 34ae0ebe a1ebe7cf 5c317c8c 02768d8e ea248dae d5a90cc8 33732caf e653cfb4 37155ca2 c29ecf65 69c6c420 ebb25272 53c38ad9 7684a26f cf99ece5 f24fa124 e9aba1f8 dcb571e0 f91de075 d27973df 26ac1759 caeb1320 34d16a83 de6377db b508f632 c313add0 aa8e87cf e3aac23e 9a2726d8 e33c3d48 f2943801 ec81ecda 425c9963 0fc10f84 d0473799 78c0ce30 de829894 b9752dee 1b1193d8 46e6e078 6c9af474 236bc764 da3fe344 331c5266 b5fc98c2 cde69c98 dd72b52b fcd25ee4 e7fd85f5 7b0676a6 40d49aad 0ec1960c 80f064ec fc766835 fc587491 a12f4377 b8380c5d 33b2d2cf 9d81a352 717c853c dc63e939 792cc6e0 2567dcb3 417e9016 0a0a28fe 7e263e0b eeeefc62 f8ba3937 ba34a046 c528e8d9 3f052b09 b1d30859 7158e74f 1b07310a b0549089 7365e227 76412780 f04c1d56 6c617e41 1a1101bf e3ed0fc2 20cf31c1 9b47f63e 91a2bc9a 60df13c2 4ee7e557 04862087 de321d2e a1e43a7f 1d4413f2 1e30d267 ff64e3ff 5bd5477c 75178393 9b88219f cb010292 2a8f7f61 9d165794 fc59d0da 5b5e66eb e3f211b4 25f0760f a03bc573 ead253ca 3b556b8c 2e1b1426 92c0e6a2 a15a8175 e07f43ee 5fe8cac9 072bfced 65ae6f2d 961b503f edfb4692 d3391246 f6f526ed c8eadece 1a698e86 3c7330a6 cfa60562 9ccbe729 adf4f5c3 2491ca7c ee83aff4 5a9012c4 b9b95776 d38f1e2a 6d744d32 0c2ef576 0827c42e 89543f83 3c7e9e63 0cc15139 befaf036 1065b3e6 2b862ec6 795a2c6a 3a7fe3ab 7750aaa8 d438352f 1bd12f03 eac89bb5 e5e3a938 62b32dce 8b490bfa 7216213d 7a378a3c 6f23f232 f5e4f992 5ef94925 0501c088 67b93711 7c59f315 f67eb670 5cac4f4a bb5599ba 87d373af 67f27c1a 8ce0f618 3c596e81 5131d9be c7f85910 be877d2e 3f5814a2 5f76a8b0 10cf3af7 9b66d3fa 0a33ade0 47abd0b4 7be960d4 7fe8d2fc 95fe8ad8 78f3e52e 57960a38 39b77d94 d333d78b d832a0d4 4b9c5e7b 381456e2 ad332157 74866170 58b7f4dc 09999409 f6b1f3c1 56c129ab 373cbaf6 ed53ef31 258f6fa0 b1aae092 107ef4f9 add129b9 d290f048 88f5da6a 2ed9826f f979d405 1b54d17e 33938662 e51f6be4 6bda727e 82484b49 96e4ce4c 409d6bfa a2eb77b5 a8749e6c 62aa05a5 544cdba3 7566538d c26cbce3 788b8ecb 6f078714 9c3454f8 384e9deb 5fb81ed7 6fc8b714 91e31e60 8f7bdbbc e017b3ee 296d5a17 cfd7f837 69e9ebe6 a507de0d 33804d12 a57a70b3 61e7dd09 8094a57a 3d756a92 3da54b3b 6a3824e7 6dd087bc d0754632 ae98cfea 32f65a9f e341b1b0 c81e95db f3847c7f 2469326c faa5055c 22e7cbb8 b51e11fc f0de77ee f86e55e8 a318cf92 f03c9337 3a4019ec 3db0d4b5 c207ea91 6a75cfa3 b0204be2 3e57a8b1 ee40f91e 7dafb5e9 bc0c36d1 ea668064 1bb0fc76 d72ec6b4 a6331742 e814f2e6 f097f18f e8f9f8c0 bd5dafa6 64dec33a cddba57b 60b0736d 517616ac 83ec962a 1d46f438 5299a4c9 8393e475 9de38b81 56f5f53c 81b563e1 a0af4aaa 2feb8279 89658442 e537d286 34b39003 35f22861 fddfad2d b2ca4e37 f50ed40d 1df58e62 5e06a6f5 275a0ce6 4a471d54 a3cfda83 160894c7 ca9c6695 367e4ccc 48cf1062 47683f40 370fcc1c 7a7cadb6 07b75a66 64a0ad24 0f22a288 c971cc1a e917314f 7988489c b4b222e6 757f67e0 48464da8 7835109f 1f67d6d4 55c9febb 7e6860c6 0bdc9d12 6b4738ba 0ce341d4 72c61fd7 d489b5f1 ed06863b 310748aa 1a8aac8f a80cff18 d85667b1 a67a2816 7cd1e7fb 34c6f0b2 02f0633e 2ada3f5b b685dd04 b223ed5c 1023a9f5 b1926908 2922c9dc 88e9653d a1e401bd a6081df4 14c62f0d 8c8ee5d4 ea26ee18 851a1cf8 87436fe6 d81a8bbd 528cfe0e efa4058a 3b5f8177 98875ed7 82d0f383 5d76b6e4 a1e4a4bd ddc2adfe 433d641f 833a6827 3e147cf9 eb134319 ecd009ed 9dc480a1 eb3540a4 f9456f13 22cf7fe9 91528fc2 276adba2 94042d58 97e3436b 8764f3d7 cf6b4237 58152d4a 230fd08c 9203129f 02eca9fd 1f5db1e3 e17000b4 8be845ca 5c33797f b9de3bf8 e46fb502 4004afb4 ffb4ac69 8ff4ccb9 a5b5c535 48f04690 c7992ae9 e57e4996 e277be82 ad0f4116 6814e08f 64b64c63 1d074435 50c3a956 2da4953f fadc3d99 d818250a 03c3048c 066d018f 552780f3 5650de3c 5a9b75d7 cc476d9a 6130e8aa bbc791c7 f5330684 155e3e5a efe50121 deda0428 97186479 d5bc518a cad7ca89 df76ae2d b5bad63b 2f4712b1 f56f46de 3af5e903 d8b79542 e3692491 11b080b8 a3ccfa9a b1aea962 cde72017 32cb6967 5e78ecf1 cd725314 ad8daeff 6bcfda23 89cfb732 1ea24b25 6da4a86f c1733c71 51d87351 29ac8876 84ba46d3 09d127bb 7363c9ce 642f1afa d35e5f77 4a1ffa35 8a7d2652 e62af652 d8ec8ef0 f0336e88 c38f4434 1751ebc1 d6643181 7b623c9c 5f8f1c51 7ade7b20 76ef66a3 9fe34711 c1b271f6 85a01948 1008220c e5deb508 e8b85da3 142584cf d62a5b49 5946bd50 74ec509a d1864d1a 316dc115 dbc72704 bbdf8fd2 96ebcdf8 111b2b06 6a043cb6 0532e823 41d2da4e 7d5e6dab 380a7fa6 92c54917 b59e8852 204bc55b c4506b69 887d75a1 8eb94b0c 9e2c4499 ef84d37d 6589d91b 240070bb 8ade758c c1e09fcc b0b5ae89 36304f76 425cf70e 4ed6be3b a379353c d17c3cd9 22d8fa57 f5de69d4 6a739056 470e5652 6ff22b74 7b06d089 162bb698 7fdea7a3 0f9c0747 6cba13fd 940842d7 c466c27f 8ca43a4d 05d16911 9632f1d4 d9202edb 84783cc6 3c19b937 7a5ec2a1 17398694 003e5182 54774d98 0ba83395 84022d2f 94cf335e 7f19a018 59e07d0f ecb56281 9d7d3d94 d0ec678d da7e9115 06d0174a 8a979d4a 4131e1d3 fbe41f71 ae27b241 4033cf4a b5e61e0e e3490e60 e6d079b2 2a275a17 76704665 16beab11 9db99f26 3595462f 7832216f 4fb8427b 8d63f0b8 30dfb1a8 d72f8239 b5fde43a 34db6f9b 8d8b3b03 682032fa 788cc6b1 fa4eb394 973a1791 ff9b5705 85a60288 9b5757f2 7dd5f2a3 a01e8dd8 45384a7d 3eb1fb72 b038fcf3 20012b3b 6d4115fb 80196a71 b4964226 a28a1700 6cbe2e14 a387d2a5 5c863d0a e4db2cfc e03736bc 47630170 13116f71 10cce658 5e61a89a af16383b 571e934c dd448c85 9081e929 f7e103ec 3b1af836 febc609d c3255e3b 87f7a184 9919b2cd cdfe4c95 c6bc753a 6c508b22 5c4e5d8d 14c65e4a 22cdfd1a e7c74762 cf461679 c9ffcc58 efa3f251 00d63e72 33d97175 4f3e16d4 29fdbc99 a1090a6c fa11d68b a00e4265 3056cb4a 05861110 489f5128 5d7d6a9a f6004979 14cfa991 ed9ee873 250fc0de 281c9cda dd5f16e2 3145572b 6f3d49a2 1fe1865f b28c3ace b6fd4a28 7f6e7aa2 13ddbdbe 8d30e3b1 f721feb2 5dd16433 15f9c406 e51339fa f26e4545 aefddccb ef0ea6a2 07e0db96 2d7723a1 1543489d fa10e4cf 2302fabb f6660d39 6f4fb8bc ec14a78f 381a2b76 a41a9545 2f88decf 8b62fa71 bd9112e9 7de28dcd 1c3c4ccd 877a62bc 011f21b9 992b8e46 153d6af0 deaa0536 75e80cfa 9b6e9ca4 a9fab13c 8d5041f5 2572bc0f 755b5795 740033ef 582d41c9 61d8b0a4 9cca6e16 63ceedbc 94ac843a fe9d21d3 ef90a877 40e2ab07 59647d0f 5e7890e5 28b5c523 50058cc2 86409bd3 f16e9455 c38fb8c7 6e1f1392 e8b63656 9f8824e9 d9d52867 d3216b94 b628c0ec 2a6193dc b21d8f0f d256c5ca 3ac78afc f1f9027e 53baab11 71b71b40 8c12c891 e8633633 2f9629f7 344ba23d e10f95f3 ef7ea253 e41593ef de821bed b27a5d3e b71039f5 860735e7 f63f6d0a 5a836c98 b3d46d8b 5e8c2e48 b4ab7df3 8028de94 a8ef4f76 f1307e53 c1637bfc 63fe4f0c 5b105f96 04515a2a 4e6593bc 8c006097 c3c72aa8 48861421 057f153d ef8544f5 1223ac80 d47f165e 7037d734 53934bfe d2157266 9ef96ec8 6a1f022c ae982944 675fdfe2 8e099d40 9189ae1c c65dabb6 ed0a6bb3 2aaf01f3 2e8e86e4 69b67b5a 30deca5c cb38fe0e 67b5962e 4af181e0 d2fe08de 5f312ccf 940774a4 7c6585e4 c79f3dbf f2a64b19 bdc37e76 f5095d7f 5a26a2d6 1c695690 399ab42e 4ed9c0b5 e60d7145 2a27cbb7 0bcefc9b ded62d36 707ad804 81fb7346 f4772bf2 aaea2cc4 a537ac28 6c9290e6 df34232a 8f4576fe eaa08a6e 32b3bf95 ea9add21 6809a594 47b27915 362ba4a0 def255e1 5fbc2bc3 e9777cf4 0714b204 106462ce 91552ac6 84accda8 22ac7c60 e68a1cc8 88430d5b fb703756 02c2efa1 1914c386 063cdb3a 74112c2c 6f34feed 8ea90b9f 0ea2ecca 119c4eb9 001c0d3d 04a4cb48 cc006990 3e701417 c5a31909 7f2915cb 62a0a9e0 f117c23d a257275b 1006ce14 5e92c674 3a76be35 d83186c0 716a24d8 bdf21192 0b88e1cf 1aee8593 c0244cb7 3edc853d bd720370 9f659f3e 549e7a35 cc322950 597fec93 c0bb8024 1cbf9a95 5af44521 4045e136 92e4b82e b6576294 5048b98c ab3f1f44 a7dd19b3 ef12a7e5 5c9c2ff4 3211e460 d53e70f4 c9efa450 6ab5f529 dba6b7e3 e0eaaed6 fc3f11a9 c4706b6b 3ce7490c 80f495fc 92082876 d71a744f 8be00663 46321793 e88b9c21 3b86289f 91aaaa66 3a308ed3 d22bdfcb 808832ca 2cca3932 add54cb2 43eb30e3 e3ff888b 8ffe298c 3798c475 74e3a4a7 0d9b8bfb 6ae9a4ee 0d391b88 6f1993b1 c2093f3c f1213da9 80022b01 92dcf43c df0b16a5 383965e7 69aaf128 2ea80158 c5605702 86cb1ae3 634a8ee9 c6c7110f 55ea692b 341efab4 3e1776d5 41e7677c 3570b3a2 e884dcf2 da288734 7c5d15e5 db0ddc64 95aebbf3 3e587fed ef88a829 46c93888 882a5ce5 9e1feed0 0ec3425a 5c7d0082 fb8cef6d 0f0c4454 7ca12f7a 1d4e0830 ad03d00c 2e775534 f4ca9c89 f474c42f c98f7810 1a944589 02465844 4abc79d3 ad36e7f6 338273cf 09a3a5b8 3744d470 9f39161e 2c28c9b8 906e2c6e 77c20eca 95d39db8 410e52ba 2a59774d aa28f164 469fe53e 2944d509 b085ce5a 13f466f9 911d655c 157f21ac d78cffb2 85f8bbfd abbc1c32 3b18f6e9 bf8d514e 2fc59bac 968058a2 a5325232 2e89833f 7af38b0f a8a0eb12 d7b26761 2b9137ee fa8a0c13 ec40f2bc ae801df1 a0b59add f4e736a0 9310d03d 72a09144 6469b491 129c726b 816e5afe a59247ef 91346267 92349416 b5a10e9f 015847cb d5c4cebb eb138917 a6277a4f 2e194dd9 fe08bd32 770e482b 9f1285ca f4c49489 b8e61a6b 530b90dd adec3531 6dfea4ef f14a3dfa d1e208e9 b2f1551f 55464482 4401ebd5 c97b6fbc 1ef76d2b 55fc35fd f7f9a63e 8d5e1b34 42b0cee6 dde1b991 57c2a99d 798bda30 b733bb99 c0983c7f b6b4300c 72de4cf0 72826e39 2d2b2994 c9b13502 e16f619f f93fc404 1d553615 67c52f7c 59c4357f 3159323b f725d4d8 f98faafc f0163b8c ee76f347 8a4d9026 b79f590a 7822ef3e 20c9228e f489d949 d7084820 649ee6e0 c4608391 d18fa073 4199bc75 0eec06d8 74a69d93 6f9c6447 920209d1 201be870 35dffca4 6cb2c7b1 356993a2 e9ba0242 cf33aac3 c70433f9 3d242f5e 0b2190e8 515f8f4e cdfd608a 08127687 054dc72d 676817dd 0f4d3ca8 b986f990 8ec92551 cffed37e 1ea6f173 d6114683 183df150 d14aa44c 218c4dab 50624524 82a9fa45 9b836859 5f5929b2 9e202c94 7b4a3997 5253a931 8870d67b 67d68367 6e5774be 89b6c09b 8cbf9024 8b415408 61f3791d eb4bb868 1edd78f8 bdd792a1 9473de05 2ec8dbd6 f6316fe5 dabee78b c4d478dc 3fb3acdd 90e659af 6617a0d1 5317e509 3e82f28e 2fa2e0be 59404e22 600bb066 7cee901e bf12533f 905726cb 72bd6fef 61478feb c9dfe37c 66fffbe4 103e37b6 e8537a96 9f7bbffe 9fac70c2 bf4def95 88670b3b f9b32be0 8f18607e 1e5e931c 8e52e33d 6d4872de 73d309ed 40196356 bada360f 44772d3a ef22f8f1 b2e85912 41021f34 5cb4985a 20af983d a69e9171 e52459e1 b60d0e2d 3df99fb5 d0f5c425 0cb87603 0d3e3c53 bb90da90 3738f540 e3741458 f3dfa6b6 a005cc37 c7db0f72 ad979171 150d01ec 061aed61 6ba27207 2bd488fe be5af230 dc642eb1 40afb9b8 4f49c7a3 cd87347a 7a05b014 ff173edd 0bbf149c 80c71d98 8a2e5163 e68774e4 03f9cf38 6ab95af6 6052dd26 c4806f03 271ebc0d 991ba0c3 c04e7253 8d428c04 805b2ea0 611279ba 8f01ca9e dc0d23a2 50fc00df 27a1c205 51368efa c325f40a 607f06e7 42db8c87 796d573e 1defdeef e5f52218 3aab4740 06a947f6 cb863bdd 7893474b 8f060e5a 51b8bd89 d2939e4e af3aa5df 9e7c84c3 2e66d36f 70c9a22d 18994af8 5956897c 56542d32 837c49f4 44921438 42cce5fc 02d9147d 6bff0377 07697a8f 67c10c25 bf919559 b7a81500 34f2aed6 65fecae7 3e816d03 fafeabed e0694595 5ab56a77 ae6d6deb d4bab642 7c216663 8701ef33 acad7a7b 986fe48a 4a684889 ee3bce39 81e7fa55 71bc34fc 2d3e8d66 ac0263f1 cfced8ff 4fdf07d0 028b4d3b cf20058f 69b2f5a4 b3df11ef a0d16ba0 692dcccf c1e2db20 929a8e1d eafa246b 01e68f80 d91edda1 4f3be86f e594ad72 43bce8a3 828718eb 3ef1cfb5 eb29c7d4 bcd9f810 a9cf99f8 2e8f280c b6cbcbac 0cdecb2c ba190783 a654e5a9 d7841c1b 46938155 78ce3da3 2728cefb dea2de33 19e2be8c 73e4562d bf3a9f69 31e61d26 5935144a 9b7bb7c6 67fdd6ec 624b4880 150c5eb2 d223d2ce 4c450bc3 87c96469 be5e7a85 4ab414d2 4e192b3c a1071d91 023fc95f 051f8ba6 cf09bbe5 739900a0 e3c43649 229d2ec1 698cdf5e ba53e090 cf9008ab ecbd7e21 5749cbcd 3de8578e e54fd061 7a02af83 6702a733 3f494fdf 7db04c69 4f8b2264 0978848d fafc9e3f 740c2410 88faf781 55d4d2fa dcf1ac3d 06f6ed3d 12316f61 62a17f5a fcb70dfd 5ca1ba55 984296c6 3359ecb3 88171d7b fa632931 aa5ae401 c8cde4ff 18239bf0 cf1131df dd7e19c0 2bac6e77 f0cd30af 647d5299 b5be29b0 fdc58cd8 bd615418 be8d2a4c da0e5a75 13afb496 651ffad0 056931d9 966219ad ba4d823b 1002ede4 e58eba4a 548572aa cd2acb1f 538434d4 d12080f0 75664d73 2e8a8dc0 1f840436 52d4aa2a 4549915b 008560e7 eb70af7c 888f3faf b4612e1a 3adb52e8 51860e38 38ddabd2 52fd7fd9 63ce6841 7981acb9 4fee49d3 15dbb6c8 f84ab0ac 74637e43 9a98ba75 7c765878 f9a71d1c 31b7f291 f9f15789 909caf63 5eb4e063 3492c6c6 2e118f5e 3434b47f 5cf1899b 57a84322 a4303d19 407b8e2b 76232063 b318878f fbf6e29f 6280dc70 deeaceda e5ef1268 fc753100 6d17f8da a7c2926d 29e770a9 06775359 ef28c012 229947aa 9a106eed 94382aa5 d2876aa3 87c56b4c f5ae7bc5 b1d1cfc0 6f50dbf3 5bf9b730 239fb314 92a5da9d 2fc416f8 5fbd6f7b 4b3ec686 670b507c ff0df95f 098dbd3b c8d8c552 b71e6b55 5a826b23 5be18eb1 afcdf559 fcb2e170 418931b9 8c5527b0 27cb1b32 be9cbb10 647b69a5 d48a3b41 b3bfea28 62b75839 87f88dae 20a53f44 1469b9d6 173ace83 3f0bcf3a 77cc3e6a 529333e8 86c1b2fa 25917df6 2447a13b 9a735135 77100e0c a6933271 17b1f227 7ae23093 470a4e96 c873d52a bcff466c f748aa09 e951dd1f 7a879e24 b10d3bae e956c081 a3bba5aa 43e0b35b 60febce1 5a261f8d 5c5555be 95797998 334079cb 7ec46915 29921438 3819c48a a93238a0 41704d7b fa9a7641 7ab9148c a3c0a3a6 cc892b74 8ade3b9a 98f121cd 379ba8c3 c1804570 edd146d2 b00f70a8 fc4744c1 2eb21a90 ff7a4e8e 35c1f4e9 c03ef700 4deeca9f b2428938 0989bbb5 b12d2fa8 95305686 58bc93e8 3f96d331 5c343a47 bc727e98 7d549851 922a5578 2cc9f875 7f50bdad e817ea07 30f385e4 92293f62 711a3045 b950172f 0e2dc1de 62e12673 2e01b9ca e238d597 9073050e 8b1ccd13 0a6387e8 d5d78b81 d8da5c06 1dc1b7ef b18f2ba6 526b904a a80b4af0 5c45c77b ecae592c de2fe9e6 f100c821 2fb11881 573a78c2 34362ffd d14f377d 88afd587 a666412c e4557ef8 cd1844e8 59d16e9e 768980f8 2146c010 4617af08 6f6babd6 0d236a86 59f115bf 31a52af4 f5d2fe08 382d9db3 11106a44 fb4c0dde 434e47f3 6f255b49 3e423114 c0f5d977 dd6abca5 31026c6c 8b3a249a d1dcd52d d7dc756a 96edd0e5 94df2350 acede821 56d5536b 2b20641f 65feaa5e 51c6b0b6 381aa8d2 03ed6461 afbefb2c fc0814e1 78c7d99f b760f275 c8283965 7bd6318b 57e51a2c 440009ad 55c378e0 80b8b1eb 2531019f aabbecb7 d75efc14 6c990837 76feb750 a0788fbf 163047c9 64ea2551 e7d7fe37 de90895e 46042787 f4ddce3b 5e28fd55 46caac18 4ac6f9c9 222ea740 461b0e78 94862a21 c6001bd8 2d7b59f7 efa470f9 4a3ad204 c95a97ec de265abf ea5715c4 76601e29 bb235f3a c38246db 0b9773b2 16a1e389 30e1b594 0cd59b92 5c8395d2 44219858 6f74adbb addeb921 53e63ab4 7b40f621 0b1258c5 4af125e6 e71e91f6 56d483a3 bd626192 8c0cfe5c 19d3f5f8 f23bdace d4341429 c5c61549 368fb0f3 cd222e10 b605b71a 66e77b3d 673eadc0 5da04d87 61601311 7c51d032 8e697102 b22b6ff4 003bcd83 663ed28a 81bd2181 ed1a3d26 fac9be8b f29cf88d fd981df4 19d4ad3e b2d00fb7 42231c24 7ec31fcf 48699910 b9257fd9 b34853a5 9171ab35 d76a2035 7a0100f9 605cf923 a7a562af 38f8ae11 eb62515b 170d801d c3ec87c8 855f605f cf444c0e bef38417 7abb5053 dea1f5d0 4bbfb038 31535721 c4aeea4c 651d6ad0 22825255 c3e88a93 339ea3ac c8e00ae9 4804c4f5 cf965076 ad0582b6 7b87ac65 2a8e89e1 b4cbb17b 04f0c7e4 2e9799ac 98116fb0 d673d749 d41efda1 8bae546d addca636 3f3720ac 3cddc3ec 0be2efb2 81bc9515 cb827969 2fafd251 52b9aa11 14021078 4cd4a093 08c405e1 237b4e3f fb5f6ded 4870e2b8 55576847 91670b96 471fb688 850ebf6e e4a88824 b1548a51 42d685b5 327db585 17167413 9cc9802f e2d9ca44 70cf9adf 1d80507e 86f59ed4 aa693260 84cc7c34 745e3f5a fe170d28 170fce47 53426f35 fe1dd709 4c00c699 654d501b 447ce524 1a8bbbc1 50d8b04e 27a9ecaa b9534d63 5664334d 329357d5 6f86525c dfa348ba 6f252c6b 15fbae6e b3b271b5 ad835bb2 02b736b7 eabc13fa f518cee7 c7123227 26181f81 82923ca7 44a90aaa be99216c 292cf0dc fba0561a 2c0c44f2 14563306 3ce40c28 60cf2810 2419c093 7f4f0dbd 384a5dd3 53085379 71f617d2 2f17c1cc 13c6db6d b9d78488 2e28e668 47dec074 c3273d70 1e30f759 405558b6 3cb580bd d159ba46 023b21ff fea3dd9c a81182c6 97172f66 b6f78c0f 5d8480e1 4fd15b62 4e34fc90 a50574d4 8359afbe 9ed9fdc8 d76107b6 c64d8fea 380971e3 56ae6cae df67c7a2 eb195f11 a4f4d707 e091f0f4 574b6c65 17b30928 ec74074a 85177933 939896c1 85362f62 358bc553 1205fecc 26bb57a9 9ec2da65 de8364ff 1e8322f8 3dfbfff1 e7933d99 f14920dc db033e63 19f03ae7 5bcaa280 9dcc3f82 a525fc4a 3f456fdb 2567370d afa7e409 0e7a163d a6638344 1fc2caf6 a5f91432 de15423e b63946fb 526f98fa 7d28b732 382e88d3 1542f194 79202bbe 77409353 cf91109a 84597647 86ec05bd d8e68325 8706a724 b5b04850 dc05aef6 5f7edc86 557bef48 fb2c4d91 ac2d155b 0f215af5 6a7a88b2 0688214e b17bbad9 751f5217 067d1ff8 126795e7 4571a224 0b7604cb 536c77b7 b46a6c86 a22b6ee5 26f393e5 04f60c8e dab5eb10 6336f9f3 73025129 08d8e6e1 9c771d92 6e59af4d d139468c bf95a416 87cf030b 2bc433a3 12fdc9d1 fe7502a4 156236f4 3ce19405 9a9c2d5a 6231458c 32ce0ac0 8bbbcb3b 8e753240 1cf69185 2a3c68aa 0c10d76f 59ee6e54 4cda5203 954a702e 533f22cb 9e1bb5e1 6d43632a e7817f3b 225dcf21 f363960a a75e1c68 8513d924 894f8288 f6ca2eaa ee041f5d 8343d0cc 5b8a6179 d1215dd4 62fbe4bf 9260b29d 1e99bc44 bf032c06 8f1d5f47 3b156032 6d64d38b 2fffe9b9 0effca25 68f1e13e 9c88fe2b d8ca818c 9a804b89 6d57f3fa 07fcc164 c7e0ce4d d31df0b0 53134e01 4f56ad65 da53231c d065e48a 3750e33e bfd40e34 5c97239d d6c1794d d0e36923 ec0189d6 36cc7092 add687f5 023bc32c ed4ba782 bcaf4d9d c7dd9ef1 4358cfba 6d117c8e 62a8b0da b0188e47 84d0d8f1 39371319 5cdf7da3 1596768d 5003d347 77b6f835 b2f90bb9 97617489 396c3bc5 6e3266a5 4f7df084 eec0bcb0 cc65e954 faa647a4 7f552129 eb6fd1a8 65ea1e3c a3c491f7 b7597765 38d4914e ff1f26a1 5a22623d 42d04c37 2d5ca9a9 d329a5de fc3ae0b5 c906b31d 50b4adab 971af518 01e02890 2b6c5aba d706045b 24a0b0ed c9c29951 470de4e3 537831a9 be68b140 863a77cd 656bb315 c1d20358 92e39de7 f851551a f8039d56 d4bc03d0 f9247147 560f3a0f 968f3542 2b0f7d67 ac3136bb 89081784 931e3ea5 5d07da54 6645ffe3 76e815ae 82da1e19 9c3faba0 e25b588a 800c5a42 b8adf564 e9878fbd 202ff40d 5330c9e7 3277b90b 3cae635e 28d00935 f64087dc 375bfe24 576c0c6c 2c4a00e6 45590c16 68da15f8 bd42a52c 338ddfdf 329cd11e b031576a 7647f393 dd8af85d 17471818 43787d96 55ec7d06 ba2e6d6f 93b169bd 286ac8db 0066cc01 d0400e73 593f17c6 1579305a f259f187 fe230600 ca8e7696 b84cc308 0c4685ab cdac62c5 ee9f8cab 06fe00d0 c81d9cb7 b466f280 ae0707b2 0a748f9e 27f1e670 06a81546 965cabca 0a8cd3ab daae722a 2eda8512 1c443bdc 55f90c25 24485db8 0dcfbe8d b11fbfa2 df2c67d0 3a98a0ba 5d0c6632 dcf34fdb 82bdf395 90434176 95e43a64 1c30795f f1c75d6c d13f36a2 f55ad4fd 115b89e6 7d9250b1 ee73b8df 5d69eeeb 46a02b6f 72aab3b9 3c7f72ba 39aad850 160bf011 6a1c4e3f 3e95daca a0bebd02 bb798cdd 69201b7b 59691a49 287fb097 538e8d8d 531777a6 252c92e6 e95901ed d4e4ad2d b8afa244 56c94cb4 ed27686c 913c04f5 b49cb6ed 0be7c9eb 1cba280f 8f31fd37 72bc78df 00310b58 320f0ded a5aa6472 fe8403b5 95630e55 32066bec e2895faf f8f4dec9 79bdc063 9c4b3b90 605917a7 ec34968c 0002f63e 46b84038 0a030c68 956b47e1 233c7c84 e5b7afb8 ca4c793d 70a80921 f732cd90 83b37253 86092f2d 4684b9e2 fe9463d0 4780959f f669db05 9d049f24 0633b071 1ef4854d 4dd44aa8 0b20374a 52c441ae eb507ef0 f28549f1 061519a1 62e06675 42488253 e937aa43 314cfd4a f40b2439 8c606884 e0ad3cdc b20df97e 96519a84 e10dcdeb 17205d51 3985a389 08cbf862 66c5e92a ee78b38e cc390c20 d2866f17 a99e31c7 419cb31b db901ce7 d48b1142 6489af85 74470a05 99f276eb 60800781 b169f2eb 70e044bc 1898d041 1c4d4952 a4a6e212 599aa2dc 18200fa2 6b1c20ea e04fabfa 92e20e3f d1d82c5a e0ce1928 352ac59c d233696a e3370c76 a9f0d5b3 d02a9415 acf24662 58fd5f70 a1be2c81 c42737e1 43ba9fdc 5629561a 9fc9f9fa fc7073fa f0cb722d 17351bb6 568d29a1 6b5701b3 72b07d27 403692cb 033fc1e7 254e0868 3e3488e2 6560fddb 7b4e1d79 7844884c af95b645 e239f0b1 5ec976d8 4309ba53 ed790b05 2f2394aa 93734263 b6b5ddfb 726d763c c6096bec 94afaf62 c4d9c62f 6ae1794c 66612570 d4c16095 0a929f50 fdfbef6b 13679945 63daf4c8 8f284cb0 3d2d5451 1bfff3c3 bab07a16 580bdd2f 3144531e 9e1c9898 515499b6 ba4545d2 57fdcc98 870c47ef 92d2ebcb aaf7df64 4ca32e40 982f843d 4b3cd4e7 04096332 6f72ff12 81ac2e9f 2fba690e 99d26b52 0ae3a508 53fa5914 e3af3881 76f8ffd6 bb31f819 7b82d288 f98d7340 19380248 845648db 13cfabbb 023ce6bd bdfda0e0 7655de7d 84501866 e63e0b4a ad466c5f 36b41b2f b5654bfb b876bd5c c6d045c6 a751ac26 b74b794b 85cdeef8 c2cbe06b dfeb79d9 ece6c556 f6ba062a 5a16ed21 480cc03a cc5caf60 42be0218 03b52e76 7efed87a f2fc6aa9 45caf98c 306561c0 5cc43d42 6b73d7b4 98fa8d0c 6e5133eb be367d87 dfbfd272 2a0f888f 2247e1f3 56c87fdb 3469d9e7 fb7ef679 10d251d6 f63ea940 40c5e906 11ddf53d 7a6e6740 b27f49e7 ad49aab2 ea25c8b7 733f5ec3 0e6479f8 b8be5040 aa648509 eaa59462 7f6e6ed6 579f54a2 9add7546 f44dbee2 329cffcd a65d5c96 472908bf cf82725c bc92477f a687f45e 3ca0b181 c52cfc80 3feed466 f7041db7 27f6865e 42fe7ed7 01147c90 6a4807bd ae105ccb f2aeda30 6cb6c566 2483b6e4 87ab4121 67d6aeae bf1c687f 36b81dfd cc7c8977 64efb5fb b1132b38 71cc4ac3 a8d1e008 40c6eddd 45206a3a e00c56b3 96f83943 a196a750 c6d1c7bd f918fe1c 6ceb071c 0e04f1fa 816a74d3 4ce7f838 6b092905 bbc4e32f fd7a6446 33dfe30c 07197cff c1a1be5e 325f4934 30c2c51e ec610248 e0231cb7 b5679062 8ec701eb a2aca815 dd195847 1ea008d2 5a709748 7f029725 4b0829a3 b6a1f15e e646bdea 0b2bef2c a3eac649 cc8ae8db ebad8d0a 7cab8b0b d5b54939 806aa5c9 7c4b7e5e 1dac2589 812716bf 491d5c6d 05eb1e24 a07352a4 2ab130e2 a07555e3 d4a19d9c 1099d559 313596cc 4cfac259 3b84e25f 75d6c73e c8b60dca 06dc2425 8c39cfd9 c12c9274 3004d98b c022b3bf c8a5e9d8 c6613d2b a53a6268 02f4a35f 185c1259 7a86dccf 916fea65 5ab73611 77c97836 16caee66 39ff1454 040b6a10 5c2bfa14 9bb16b76 ce25dce0 dbd8ee0f 1ae2321b 34e92459 c2590eac a3df510b 0c9a19d9 a8d0b817 42a73c25 db150226 3867c729 c523c3db 848ecb0d 0a033fc9 6cb8b471 293d7f21 9fc9bd88 c6c979f5 347d3a37 8a95b412 3c160dbe f1dfc7d3 52f9fbf1 6ca3205f 53dbb219 cb26d792 b3a527ea e71f1940 42e5fc6f 03be803e 3489ef0f 2e5b7407 ffbeb5e2 0aa7f5c9 506afb0e ef69b8a5 8cdca80a 46c19914 14da5eb7 21b38e00 683ab05e 36b4f52f 791a0bc8 6cac5c13 3e09e033 f3029531 9859a72c 826b2938 b2231963 93b2f974 c909319d 65b4661f 5555feef 2de440d9 760dac4c aceb645d db0bf2c4 cbfcde38 3d3aa23d 054f094c 3c63354a 0acf6883 91a848a4 23cf5922 d0a95eba aa90754f fc0b4193 f9aeb0a4 f8518933 92143566 b0171dae 1ce42a7c b9ef61da 0d7ef430 0894c45a 91fa43cd c2dafd23 2ee09a63 61648e75 4722261b 2857406d 5ac8ab8d f23e3d84 3660435c e2cbae3f 0d7fa8ca 234f77d4 5ce30962 29c16a05 0fe4e7b2 d8601852 4d587072 245af944 31d6c71b 7727ad57 b429952a 3fa76f6f 82a54c05 955041e5 d78c8fda d2fb177c 60cb4585 d30b3027 efb7d169 6fe5b89c 8cd503b6 6a1b2c11 2f5daaab babc62d6 97fb9e43 2e1367bd 3d858d4e 734b481c 9e8d7ad8 41ab83b4 1f073084 d63083f4 002754f7 57a4cd19 04fc31bd 266703bb 1b108a45 9b2288a3 69ad6c6d 64216ecf 05c1138b cd9f7d7e b535b690 51a8bcd9 8b644d58 e30d284a 9ea3cb27 9cb03f43 5e48b870 b58556ac efed7c86 5080b35b 0ca951bc 745f2734 cd76b175 e6365158 894c9d12 d006b7d1 ec67d038 9ce662ee 391433e7 c295aa49 ec1ba541 7521a7e8 893d2964 9515ac30 be360066 8a702496 992fc602 a97b12a5 db97306b 4ace3e04 c0d2137f ac6a7fa7 80df8470 8d489c7f 20a7a075 ba80e649 fa23d5cc 20c36596 b0dda607 8297ee36 34d3404c d2b0b58b 5c63c0a8 e8207c34 d78ae22d c8ae5544 46a7c06c a2641373 9dcafaa2 1597a992 6bcc6a86 bef80c84 ff8791a2 f7cbde28 e0da5fb1 48baf843 098814e7 74c14daf 4955f816 33c60de4 88914655 f10baddc 49572ed5 a2d89160 bedbf756 7961f448 9d4ad743 f385de80 80718b96 2837b527 0fda6e4d e54867e5 eb9c4380 642aee0e 6b74ab42 f024f830 f5a374fc 85887308 fa6425bb 269f1287 2a67fd70 aa877a2d 36ee7b35 97101b55 f3fd4e39 d206c9ca 31350254 d6d564df 10c10483 7ff260fd 851fd68e 97fa7143 ee93b1dc 3c63e093 3b19651d 415c539c 0f282508 8991d294 e5111278 a75865ab 5a58ab8f f9d1e9d6 fa55cf2d 23b3fc54 63601d33 7ea34a51 1eedefa5 3b807dbd b36e84a2 87b2f3e0 61da3c6d bea56d05 ea073f90 53ace15e 330da6cc 304d6120 24713e8c e0770bff bf9124a4 da003361 055c967a 57ad8dc5 ea9fbec4 ca8e89fd 0cebf60b 2bf43c1a 5a0a2b52 bd1b07d7 e920213d ad3fe5d6 7eecf45e d332b00b e56bb00a dddae9fb 019911b6 7928cc19 4df15344 a7f1264f b614dc1b 1e6bba52 bcd9ecd3 8c7c7373 bcedc29c d0c75ae1 cf129365 7ea31c98 110b44f4 2735e2e6 7dff5ff3 41b08a39 740e28a1 2e04f5b7 d179387c 597d7da7 04c90bd1 a5392087 aa206018 3d65f55c 7a4af7f4 a65b3569 dd370b7a 98d23aec 89f17de2 eca3afed 3e30c7c2 cc35eb38 3ee4c61c 52ad3999 fcfb0221 ec4c7e86 fd9e1b8b a0807433 c7e48589 2e9855a3 b7fd4e54 ecd264fa 7d144cef b30b3052 1e9ff754 a22e2144 2f6470f3 086ed3d6 6b10033e dedc187d 8a262daa d0175cb3 80a1515e 6e6db78d 68864dec fedcf029 33fda913 5d354611 ffbdf0b6 2e0a90af 5df9ed06 17032e0f 5d8c1759 0b6f5a7a 13771603 0258f3ed bcc19b45 7abe1be7 e2cd3ada 9f6ba309 79fee260 6570ee89 c1883464 54b59052 2ce90cda 9ed72646 3591b67a c8576038 495b2022 2434a5d5 7b8587f4 ea69675a 738e3fb3 f524698f 0c7cb9ba 97651bbb f5478270 e78d8e7b cc467af7 632f90ca 7e8e804f 8d464c3f d57f77af 84233e54 159895e3 e358d9d0 10e7c232 0ab2ff84 72eeae44 93711d5c d8ca8318 ad3647b7 7b2a2a9d eb2ea9d1 cc3f0cf7 750189b5 f34c9c65 dcfab1e4 69461fd9 6c8b0cc5 16de33d4 c7f7e449 e1c72b78 8a8e5e25 88c8dfec 744c98b0 ffd4003b 2cf6f3b4 66821e4a 83b344ae 7b241ed7 53a28c52 35881426 73dc7944 83340ceb d804432f af60b3b2 1310166b 74527118 49b2d5e8 95fcd2ff a65cef55 0e1a837c 76a6837b 0330edc7 86ba9fd3 437bc0bd bbaaff3e ecde1818 70bbdd25 1d7e634f 2c9e5f26 a5b6d877 2e0626cf cec8113e 11a3cf0d 4fbfc84c 21a13c2d 9c6217b4 dec08e8d 3057963a db278032 f2fff679 c78a6ef0 448fba3f a30b89f0 ffe51966 43eac70b d67ba46a c950b01e e4be86ad 7031f445 ed8688fd 915626fe 763bd616 6e06e37c 00543fa0 b2bd73f7 535bd03e d2bd3b84 1387b8fc 9f9038f5 68b8e09f bc371c1f ecb89f19 48991e33 e6f57968 c3137df5 50ec97b1 231676c1 358c00ae c3eb6aef 14bfeaa2 68d0515c d04687a3 df6c96a3 a5abeab3 76077699 406d1a92 4ddd49b1 2e7cd448 6a65610d 3b96e5c8 3691715c 8108cbec c636a5a2 a7eba25a 58d90bc8 f28a71ef 9e31827e 818296c2 c643836e 6f2c66eb c48d54b2 924f7050 fa2f1e5e 63915f2d 86c15be3 38958133 01def0cf 9aba0ace efbf1194 026821f0 f795b406 99c2e907 c51430dd ea9ce5c7 17e8836f d54dce80 9f299ad2 a397890e f0f3b570 7ab33540 e196006b fcfba629 f39783cd f2fbeb7b ce2bd731 1f3c6442 9ff6afc2 3ed2f834 0f358922 1d911443 7acc7324 edcb974d 00787cb5 3f11ec1c 05de9d77 857c6ef2 2be30c9c 6538dad2 13936cd9 f37d32ca bc04048d f215f5d4 dd954b06 5c2f94d6 f5d74b9f cb18aae3 4fa450a2 6260b251 14f37000 46e5538a c6b228b6 7601d605 3abae2dd 55c06401 cb2ce6fe 3e6daa56 849ad8ff 3e689f6b 971c3098 a60c7bd0 d31a21a6 0d350d53 c0ac8bfa 58cc469d 2ce715d5 c9a685cb be748ea3 953d7a28 168e9e06 f99adde9 619c2dd4 86094da7 43f619b4 8bd87209 09fd887d a035d342 91fe38f1 5713f1ab 94bbaa05 b55718c0 4e2332b8 875b5e85 241e7dd0 61a5a799 75af896e d7c2ca09 6e6440fc 9b1e6a29 3d92000e a424cd24 e6bf1e2b c2b8d0ae b0a57ec4 b0b19779 f9430d86 2343413e 3b9a95c5 5aa48773 44af7d4f cb2ce100 76ff4f0a af7d7e24 73a04796 9b0ed198 42f78d18 3ae00bcc 037de2c5 d0cff785 cbdc8e7c b7745b66 31236911 63675080 b713511e 62d011fe 8a8c808a 4ec34fd4 64c92fd2 8e849078 43eb0455 3b5e786e 596a6267 15c1a106 393d5535 a00939db 0c9fa804 b4d7be48 42d372a9 d4ae5a84 4566d5bb bbe2dba4 3a5286df 00a12e5a 614412f7 75df2ee7 002a4579 262681e8 cd91d1b7 8f780220 f44e5f68 19c0ed69 7131e2ec f12951bf 32fd30b7 8960f1b6 894710bb 33d77e0c f52f89b9 d2916994 f7772250 373f8916 a98d176d 4afac933 129446c0 eef9ef65 54e2c41e b42b1625 fbb9e432 4ba3b66f e4e4914c 86e1d02a 614c4950 77da49ba f7ad31d1 7183f394 8c55ae81 172aa6d9 39d54114 e795d1d7 078fe748 5bf5a7e2 2dc783c3 a6722b28 c753ab6e ea5c7df7 05cc7ec9 c4b4ed73 90037842 6aa2d2ae 8b5a26a0 dc0153e2 16657947 82782a72 4b5e7c9c 29420c0e 533c8f50 0764108f 90d58e5a d399e5f5 956b5e60 8deeaf59 83457b69 856aa5e0 3d8657b8 748f4e53 6fb42749 1877a45a 0992c477 125c3a02 7a460fae c007adad a3f28aa8 81c56aa8 0bbd8442 2fca3d9d 1cd4bd07 5a1f47c3 8d6b4252 3aa8a9bd bf7f0394 9048032d 5c5c74a4 82f7a9e4 5c86c548 5e4507a8 bc4ee1cd 0e9d7d79 65caedc8 15d15fb3 6fe19f17 43d41a20 e1ecac92 bd76367d 4e78d475 23d6fdff 5606f3f9 1c47fa18 d81d2aa9 52f0ddd3 93a85508 0e671256 691f4431 91b574b7 e5a6ec5a 135b5e31 f27f85a7 b156408f 2fd5b0ff 014d9b41 735f33be 1284b92a f504620e 23129b91 923736d4 4f9d560e 3fb90350 0b448900 d30bbf35 1fa6ec38 e00a734e b77d62e3 2f1c5ade 4e564650 e7817dba dab0d64f 7009072e 48555634 dee1020e eaf39a00 c8e3440f c7aefbec 78400b1b 55f0c4bb 266b62dc de67ee4f 27b7ef98 e2388656 6467e317 c6043dd7 33323fae 534f1e98 2b099a58 5b8d8ef8 3957e6fd ca4adaf8 c07e3c16 5d135d32 327b4526 9561287e d3392eda 7a9cc225 d210a07e c065b9b3 9fd055ac 8427d364 d5bb087d a3d4a903 207190cd fe7dbebf e5822b56 28adbe4a 3d6662bc e1c5e707 826be647 a543d411 ce1f3900 97f0dfa4 360ccc68 80f5ca3e 784b86b0 fecc148b 1e998513 ec017bad 92a9992f 501f2a1b 3cc61441 0aff6824 0cdc4cee d0a1631f 506c296a 0b299c85 6903ba08 90282e2f 66ba81f4 363b7683 b31c0ef4 6659ea27 a063517c b3999e5b a883cacb db32d765 43dd3719 4ca3e342 9b5b45a7 dac4693c 4ce840fa c102cce4 2d5a41fd d32098dd 8526a731 992c1e5a 49982605 e0ce67a8 0cc83e84 d299920c 9af3ea8e 31878328 851d2c72 0df5ea0e 3cdc3f3e 364bf049 0ba88be2 c050c5c1 0955749e 804492c3 4c087c9e 391c3570 23b07e77 ae7a03e0 3b233d9d 96334ddc 3ccd8281 233097bb 78283eb2 2b3d9ab6 9db65e25 81053a43 8cd0d023 bfb0afdb ef42866d 7f226874 4e440d1d e864da98 135853af 8eccc252 4c0ea22f 4af2d154 87b3d4d0 cc2f847f d9540398 a815e789 15b0eb90 3eca9210 3eb622a0 3a768c79 dc3ada29 d158a9a0 834d05d1 7cbbb8cb 5d493025 802e49fa eea903ac 05dee972 ca3960c5 3c250b49 dffc02f3 b00464e3 7cecc5af 9b8ef963 86e4755a 2b37f618 d4520dc6 46ac5c3c da48eb18 f769f10d d1c3fc04 90c4399e df6e5162 47c9211d 5849f884 b5728502 be5631a8 7793c96f adc742c8 ff95110c e1d65380 b6b55f55 2a429df8 5e0e92c9 23c87882 2e5310b7 447bdf15 c165b8a8 542a3943 c83c54d2 ef88f1ea 98f9e660 5a163bc5 322f24d4 afa88d81 5a73d1df 66ed5129 4c4da80b 1cdc883a e361855c 06cc5176 9e7dfc2f 2e1d2167 3fec0429 f8888f95 b8d7c317 7acfbf9b 8614cecb 0f74306b a9b5cae1 bed66910 667751f6 50f097ce a7f70e1b 3f57a902 56253603 147d7c79 6b69abb4 fe926517 276f1e5a 3f07de6c c6efd722 c72ec806 e0498cc3 c03b375c b6ec337d 85164e9e 964fff22 1fcd1472 e460e645 d50747e0 0f884e5d c4d2b6d4 2f515bb6 0bf1e3c5 adaa2085 ce0e9206 6e514602 a634b9eb b8de8802 d449588d c6ceb305 b584bc01 f4c26c00 28da4807 6f805128 5893aec3 f70fea98 742d9ae5 6feba919 c3b24ee1 9c19ba20 fde205e7 9acd94b1 c0a2f434 3a191ed2 8d510c34 aebaae99 19c63d94 503de818 a576f100 cf4d1f93 c8f03c5a baf4a2d0 64ecb718 96149b74 4b98ff99 5e4ac0ba 58ec98c5 2f967644 7339f898 0f471e6e 8d3028d4 0fc3cbc6 9511bbb5 3b5f1f6e e1c28e8b 86bf5794 76ee3221 b1b52773 4b967c73 98ad9049 44a18c26 a96a8976 8136ec17 7805264a 0ac99cf4 c1783f8a f3322942 8c8292db 592c79a5 a57d1cf3 5bf8e082 bab21a84 f1d09cbf 2eec9baf 0d99dfda f21bb1d8 12b66496 ddac3fbf 803b7e07 b65bbfb1 5ee6d40e 34cef8eb fcebe723 2a488b9d b14b6d47 81c29862 a60ea918 5344aee3 def04be2 9f4ff1f4 d2c963ae 2024926a 45fe486b bf700918 06b33b66 11d14a89 fce37266 8245bf24 f725b699 c17e05ea 223059a6 862433ba 5afa32d4 35e95084 639a7fff 47d8e5a8 2afdd572 490bec61 ad263ee7 0fca0576 d3387cca 3bb69d00 c223aef2 604a375a 564a1bca a8d80c53 5f1117c2 2ded6a8d 5d4289b7 06b0e5f7 5d348e69 0a770426 64e2a00c 7e7869fb ea3043cc f4e59beb d1911d31 33fd2352 c158ac20 10ddebd8 8a960bc0 8a1129df 5c97b54d 6f86f925 6323a566 1e54b10a 8c6e592d db7fa883 f8c2abdc 69bc6ad2 6a078e30 b5174ab9 fd8f3cdd d09128f0 90bfdff2 79110530 fdd2d25d 47ad9176 eeee7b63 6ec56e38 6ce77252 4b06d735 cf5ef9ec 83856fa2 a36d27aa 95c9d55d 441a17cf ed0f2448 acb6dad2 c97f192e ad86ab71 df1dced3 8c626b21 4e818317 13283045 cb2a5b7f 298362c5 96337a02 2dbcb83b 13d0a810 7b01a149 96c9ec01 6237bd6f 10fa2b63 aa432a00 9f742fcd 03fabd0a ad1bd76b 4423a3f9 210a41b0 fca5d498 bf948fa6 5b7670d7 8b7e6110 63a846ce 8b40435c 4ca91f0e d421277d aa661cc4 cede5064 43360a08 ff4f0793 513b7b2f 0607dde2 4d50ad37 b7712f1c 72a11d34 413934c7 84aa435f 4ad69594 1e44136b a76af2d5 ef34a9ce a4d04039 ed33e494 acf1be67 866a5677 693349f4 15bf693f 31597557 de2787e8 235cd770 a937d0dd 9fed0686 01a3597e 85c04121 c9c59a8b b2971114 4c53d272 7417c6d3 e3812b52 e7d16df6 2a1a165a d97112d5 92439841 012228f6 97685dca 3d105f9d b29d485e bc8beade fd7d4112 8051adda 6cdb6e6f 0a918632 f36ea256 40778532 489834f1 6fa93fda 35dac267 19859a57 90be3bd5 c6425585 22176da9 88353709 3beb8aad 06aa9e3d 0414f978 2c9bab05 b09ecd02 f94d5627 36af55bd 4880b16d 6816503f 67400c8d 80cb1672 4c998458 f55314ba 34978900 90b32c9d 167f755a fd7ce348 344ba8bf 4cf3b812 40c3c2b1 7f61acc0 d02c7bcd 179db0af b7160bdc 922fb0db 6b610de3 e85129f6 2d793707 3bddfbf8 0b460b5d ab7e8234 d3e0ceaa bf4cd916 2f94cc97 db1b4fcf 7aacf1fc 51308996 7692545f c2828783 c4c726db 792669d4 66fbcd66 36390bec 9ecc9f7a d0f73f0e 93e1ba97 0bbdf63e 4bea6a43 b3db124c 22bf176b 732ab2e9 3cf1be53 6d3d0ddd 3eddf2ed 2d437a5b 4681ce1c 25dd1e78 a322e1cf a2ebf45e 8fa9106a be0f7821 796d47dc 58863080 ffdf5e32 c6af0065 0c07d096 fc353add ca067eed 06ddb52c 7e6db781 0a36385b 0b1721b4 165f05b0 5734aa26 7ff67b57 032df0e4 d1c77e8d 8964d8b0 bc8c0ce7 2b1d5c50 8550943f f7cc5828 4d8dc223 7a50e659 c739fb7b 13ec8fe4 185fa809 c83be40b f63481f4 fa5138bf 183dcd77 f2453d32 69375e55 9833b13b 35406160 0a4242ca 795ae049 e43e457c 120ee62e a24bb54b b03b902d 971f9068 ba902e77 5a78bcf2 1b4eba29 b7b5a521 9c25ad0c f2364d6e b6bb3b54 28f36f6f 27b31d22 f4651d96 7ce09cda e028b0f7 b1e084be a0ea8cff 95dab7d6 eafa8c3a f4813fc5 0750384a 35245412 029524ff ea82f66c 813ecf63 4e0ba46f 260c5296 c7744c2e c0e83e81 23d5c1c3 56e8d72a 0ab00318 99aa0ebc b4c20a5d a41184d8 a9b74eb2 a3ecabfc 1bbd3ff9 06f5c933 2eeafc13 73316773 1f29cd5b 3160044b 91df0fc6 b8e6bcde f959c4ac d69a8215 a7bea418 045ccd67 68f41acb 0fb196c3 24cf2b37 503a7aa5 3bbc2fe8 fd107223 33c9cc4d c4f88ffb 9deda271 98e42519 7cb1551f 1ec4009a d01180ff 59d531a6 3ad312eb d1db191a 75226eef 123fe493 b62d13ed 08e10953 a7e12c06 403b220d cf89973b ba3d2f53 f993237a 7b171286 6c5637bf b0bd7f8c 79d7b730 12ca128a d6308af5 6d7ca87b a8ba8d1e 2fbb0f73 d4d183b0 a9ebd6c4 0bb91a2f ceb03785 6c487ee7 0a7ba1c3 42db20e7 9b994678 5009cadf 8236fcf6 8364a714 838473d1 4dcd4deb a4efb88e 26b586d9 5f9b009b e2b6a351 c4bd4bb1 7c31ec5f 298cb93a d48cd3f3 820f8ba0 c9194183 989f4427 747ab03b f5072312 73a41242 f6b72887 5e4a6783 4c916bb0 03d8f395 2f102012 470e19bb e671b3e9 0f6e9b01 db13561c 0caac5ae b939cb26 148351cb 3124e654 b76143f8 7797d2f6 9edc47db 06cd3f5a 02f3fa3b d77e961f 347dd68a 7c860d14 f41770ae ebda9a6f a58ccbaf b019566d 635dd3fc 866d2d5a 37f394a0 23ef45d8 a6875bb1 dac5f60e 97d67146 d8cad0b0 ca92676c 01aaa313 2767c0fb 5ff81e1c 9b46103e b4146294 33ba98bd bed1206c ebba8f89 2fa47300 f134b9c3 3afa91df ccfc7261 67ec9c76 0abf7b07 179d9bdf 046c7cdd d2108c25 5827c190 78a574e2 d7d07e0e 7e5039c5 b995f53b 143127f5 d960d810 7a91a4b5 7618130e 060d6eb5 edaaaf6f 2159ec8c 4e83f205 908d4ddf 91790f63 02dbd673 e313dc4d 7fab461c 23ba1e15 d862ad51 f24d6af0 b88b64aa c495d143 5a7607ab 742eecab 1c10563a d793853a fd97626e ab25d1e2 a6c13cb0 291ffdf3 edd3092b 30b0b424 22d63d3f 778ccd11 e11eacd8 765e1d7c 45f2778d b9b189c9 02d6d37f 7460fbbe 29972e9f c8a9bb69 a822900b 1bff978e a7dbe5a1 add1240d 3d930da1 a56eab95 684b86bf 22dde45b 7c52c929 02cf4546 375bc0bb 769f87c0 8416699f 116d3e4c 612f6d7f f50e16ee d58f8e6d a2b483ef 88a5c4e5 515610b9 788e7313 fe7ea90b 0d290eac 61f69f5c ec3b6a2c 3773ce95 f133bd01 fc39ed8d 5ade4421 fc1efcfe cb917794 ef6352f8 77240c02 7d9ad85d 449da7e7 c333d1f3 513814ca e2ead8b2 cd1d7cb9 8f14a6cd b9e6f0b8 a5e64c87 c26bc6d5 40bdf122 e19c516f a3ddd2f1 e25034a8 70c534ca 5fa115dd 40c00723 1663c999 31ee81c4 db2936c8 77e0d898 2609664b 55eb5baa 36e6fbd0 8ee02380 d15f0d6a fe58beee 84c7f7df 2bbc22ef a70af7e3 ecfe288f 3cb0435c aa9e98bc 80ec1814 d8c54f02 d0490c98 7e87a8f3 a6915a4f a87fa9a2 5b8c786f 92daa77d f9765374 c00a2a62 1001e7d3 b5e51680 bfff5146 c0c3cb39 aecfc1fd b287518b 419a30ee b1a565b3 2f3fe691 ffe28af6 258a5f52 0bd9f20c 9c85e5b9 bc26da2e d4f5d2a6 9ad36bec 87ce5efc 8c7c9d6d 999e79e4 303b411f cfc97e79 ca649831 6cad002b 6383f0f0 031b791c e6862f6c bca37602 2945a2ba ef63734a 6165f8b5 276f5aca c6221404 692dcd9d 5c11c8b4 3ff7de49 adee99f3 3b58fffb 58e64eaa 902f65b3 5f03d262 1fa70ec5 eb1462a0 852db61b 33139747 6a6f9265 938a6328 f840af12 3a9912df fc71f602 8a68bca2 d6b62048 771edd90 f6997f93 51928fbf a1569d01 ab0ab6fb c2c0f411 b3187f45 7d0b5f10 b5c02545 a12609d5 18895492 2cdd767d 12979150 fddf524c d341cc43 0c7b05af efdf64e1 c96bf1e6 d28c0eea 7171062a 6b9c0e04 204289b2 7bc1b6a2 43cb8109 7a114721 456ba30a 29e68ffe 48684f20 0077df3d 7124b2fe 3c1c1144 67bcb9c5 00c4282b 46105e70 554e8218 1a079257 36a65896 db0a07d2 f9be98ae a7e1288d 33646a8c 8f06c9bc 541dd5ac 107b8003 3b7551e7 063e3606 7e360817 96a447e9 7e06ba7f 1e7dc7d9 93ead271 c4ffef67 4525ca5d 47454493 dddfddcc 07aaa79c b1f125a5 ddf03b4a 769ada1a 8a1a1c92 9b007ea3 863e6d4c 4fcae8ad 3f725da5 be5259e7 374744bd a52f6a65 6cf03126 489f6793 1176f5b6 3cc1141d 6e7217a4 9d2fb088 0c1940b8 0bd8c8ec 234ee228 7770d33e 27d1dee4 f193e9bd 8feb5405 287abf3e 2c0b3858 fee864f0 c6ec9f9e b8e14e60 eefd81c7 7f2bb66d f4f0f78e 41f7b86b cd116c75 f6fc6726 989c6b45 f7499db8 424ff698 d2b4b295 313d5d8d 26ffcb14 795208f3 40447d81 c2d231c5 73639a22 5cc672a2 039a1e28 43115fb6 d4328d49 238a34a3 12f5bd71 caf4ee93 840f09cb 3c8ca9ad ce38713c 4500e1f8 535b08b3 5007bf30 0358e50d 60eed1c1 2cf10c5e 84689928 13de6cf2 8847127f fa56972e 21f93062 3f5578da 2594a112 7e21599d 23f0ceb7 d38658a3 12c79550 75ac1f51 eb534b55 34505ff8 e7ee1c21 0ec02abf 07788a54 c940b670 9428efe7 3944e6b0 48213685 7e95e9ff 269be281 a0bdb267 c0c4914f 33650c51 6e8ac511 4599952e 59a0ddc4 e70adf0b ee376bad de7a568a 4bad7339 9bed287b 51210434 f6d218f9 1833e677 2a834006 76f1d76a a109e202 475ebd7d c010b78a a6d05ea0 665e2d3e 5c1d4570 762a3977 3ec1effa f3f0a9f3 23131a3d 7374e4fa 7929900b dd2dc5b1 18bcdcbf fb085359 51c68121 bd797334 3ad25454 7ffa248b fbef1346 f712aad9 e123bc81 c39ba0ec 5154e39b 6b815f19 2ac4425f ca560331 12f73526 513cc0bd 4f5deae0 d46b8b29 757b5860 02981b7e 8a9b6b6d a3a81a5a b7a5a215 5697c310 545c1060 e86c9bac 2398b500 7511d5ad 4d6de8db fd0d5010 0501f6d8 4c72955e 007150bb f1db5e72 93831ce2 bb3a6c8d bcae68cf 424a8ae0 182d7994 13f2f8ae 2feb7ca5 e219903b c97c6a54 11e1af56 50f3436b a74dcca1 eefbf372 7e8620e8 d840eb2e 822fb8d8 e8fae4cd eed32f4e 1394c17b 27eb0b88 0ddb868f 776b6022 75a58d99 2561ad9a 955862a1 88eaf469 c2f42f05 d00ff21b 9d4a6922 5cbd1a8d 69ddaa78 01d1248a c70fd57a 7448e091 a497eebc 7c935b50 cc4158ed 67ac3e09 ae11d4c6 8857b415 37cb9e79 2a53fdae 891a01f9 32d0354c c3f2bcbf a4f65cc8 ea718ab7 e3fc9b8f 4b3e6fcf 6b3bd4a1 57fad085 0fb776cb b36470c8 d36c04fb f39095bc 237e436a b41e4f38 a91f879e 67ff4639 9d332512 643ceb30 f6b3e2be 2f3d7cdf f987531c 9f32ad97 7072f9b0 50397c9e 7107990e f76c22d2 28dd791b 33b4040a fd651cb0 f7cc604a dc163f74 bd4a5094 b42b48fc a33ec8ae 50c9f1a2 909ab577 2acdf2a2 0e4046be f49e29ba 43881e49 d353b976 f696361d 79fa854d c39e9b54 4fc21270 9a8c809c 287f2ddb 55bab03d 9a27aa8a c63d0527 11ab5bd8 c8db53dd 932c15af 0b315aed 7f577b85 8ddfc52f 3d3f4cbf ba3cffe1 990e7919 1edbb663 24097253 08c6e1b3 44650944 892a4a20 974eca00 47d2e04e ea1c48b8 50b49f41 a83e93e0 21053ede d85f887d a5f21fac c0201d3b 7a22e00b 98f3a1e9 f4a1e10d 0bd3cfed 12a0a033 b8b69a2d a4053b6f 8e175a91 2ad1b90b 0b8ea964 7d0d985c 0f785b07 8b5a6aea 1ca090ce 70bc66cf 17e634bd 3a12d0fa 8d94880d 59f31118 1726eacf 224cdcb4 8ad35892 4a346197 3268f705 f23a192e 8bad7091 21fe18bf 9d239626 9a9273d2 a2de620d aef86ec2 caf1bdcd edab7a68 488651b2 99cf7e2e 90270a85 6dd0ae92 efb5ddfc 7a7d18f8 b0e8c786 d1edf2a9 707a20f1 a24a45ca 697a3f90 0754a211 0f175684 a92034f8 5e6578b9 bf9d72db 5a173117 8f4f4191 c61dcbbd b80bccf5 9fe9933d 772a0b56 aef10228 4e34de5c 8f31fdcc 8294b424 cdc30c03 884fbb3d 2d8bd6fd 86f5d91c 39592f14 3e9071ef 96d64c0e c3413714 fb504ea2 5b3a2a8b 11533a98 9a8d1c14 8d078371 76244448 c3f45dac a26578bf 676e78e7 390244c2 a0f0e071 6608b4af c2ec4aba 6b012974 abfdee5f b7a5e853 ce3757f4 e5bbe429 783dc7d2 81f075b5 94ecf574 cdaca20a 979be4bd 2cc99750 e6442769 bfaaf03c af40ae57 a46c8569 645125d2 901fce08 33258f85 5071cd13 7fb7c08e cb1f2eaa 3a725c9d 0762ab27 b18427a7 f8905eef e54e6e6e d6e673e5 83e54492 e8efc77a 8dc2e42c 4a626e28 d2def680 63f23148 4b50262a d02c4cda d2bf9795 d87f0ee2 28185198 8f7f66b1 d0852901 f06c6ae8 5876da81 13d25476 e545276e f0086c2a 568daeb1 7c152d33 ba087769 a4937516 91ec3d0d d0c6b42d cfc7bd27 44773c3a b046378d 325df321 218d1b26 2841e3e8 dca4606e 4f7d4fd8 79fdb91d 91cacc77 a88b4fd3 004d7a71 d6b21ed4 b57ba656 b9079891 aee807e7 661e0915 04691ec1 0699a0c9 a597b2cb e710f2c5 36c2d9d2 38b1246f 94b135c0 23cc9ce6 5c133e68 7f80950e 3d8e2e97 8080b1fc 4f79e1ab 2ac845d7 12b47105 bcbb0615 429772eb fec79443 5a81ac16 369e8562 219b076b 4b4a09d2 369a61bc 0ae59533 ea7b3b68 99ad5ae6 a2fa8802 f13c08e9 fd3884a7 b2e23049 6b439344 83c7cadf 2f9d6a6f fb3849c7 0f06e469 1d591f19 3a34d2eb 5dcec4d9 aa065c03 f9cc46b0 b9977678 2064e726 dee1d680 f2c67426 769245a4 2274fb55 fb9445f4 015011b4 dbba55cf e5222fe6 5ffd2b8c 5e4af6a0 6c8faabb d203c0e7 c7522c4f 0e2ac441 2b8490ac ac80d77e d34350b8 ddb1bb08 886adbf5 ec20e207 fc38fd6a 1977312b 154a85a9 f3868c17 aaf72cf9 f27621bc 32ebd65d fcffe7c2 6bda205e b5dc86dc 7494a10d 1b244fd8 7693816e e8a363f0 a3d457c7 be3420ac 86a5802e 8acbf46d be6e80d1 f3a68927 f0e69e04 3b683f72 24c34543 6c3803d6 c92f2ba5 e0f01bc2 66191ffe 289e60ed 2a168de1 7d195a79 acd7e279 b24706fb 4266d141 d3db5ce6 1c177ab5 df0444db f7a279c8 29029785 da45828f fb270fe8 dcd6d675 94edebff bec8be5a 55090e28 6835fcce fbfb8eeb 659d3e91 d82921d0 b26758bc a2b5a478 f15f7317 58f08c17 f246b177 a9aba3b9 552c0972 8030e15b c4905b9d 7d11c386 05912132 ca0aebd7 d22362fa da50bab9 51bda429 caedb267 dee5b676 ee39375e 5492233e da550381 6453e0e3 91ef8731 817ce7fc d526581a 952982f0 8f37602e c92e3655 d2c527f0 1bf4c8e6 2e323027 f36546b5 11404a2f b555333c cb7c1e6e 29cfccdf 391ae00c fff13744 779e0fe9 2222e4c7 c643d935 937cc5ff 7df2ebcf 036ab6fa a4a22b8a 059b71fd fc311211 af17c591 90ed4933 801eef4f 3f5d424c d15a541f 51c57320 914da575 ac13bc5e f18c7d64 addd27b2 bfa0e53a 5f6b9c88 7895f1ca 2c7ca367 88a20d0d 0007a6a5 c7f9bdac dadacdd3 23c5e96f 8ce65a76 b2a8589c 387f956f 78661b7e a55609e4 509931cb 880b4eda e29ea066 4a2287e3 a0a98f48 cab77748 04a32bbd baa915ea d9490e29 a71ef7fe beef71ae 617fc8a3 e5969dff 8f36d1ef ad568aad 0349d0ba 3c68ea06 a3363e4f f018b1bc b6833703 93715ca9 7aa011f1 2cab893f a4d8c60f 4e1afbbf 5294c716 8bde0c4b 9c023e9b 388c1b40 ee3ea8d6 c16116e9 c4276952 4c15d4b6 9a2cdd7f f4295ce2 3230828c 6adcc6e2 73b2b292 d500f161 b3cb572f 04e8e847 94208e36 afccf74e 305c8485 284d00ac ac8fd88a 35cd2818 6a937dd2 d87996d3 cc4cb3a8 105bd960 e7f8751f b3b499a2 9ee48226 18fcaede dd3b6a22 045794d4 2202ac8e a9d11b38 13e0d681 dbae3bdf d9a84f84 d0600c34 9752c343 0ce43ea4 fbfd5324 39013d91 224ae4ac 2cfc2415 41fb021b 81fc7d20 c2de016d b701907f ac3e5e73 f5b9f310 bc2e339e 6d6fefbe fa9e1719 a56c2ddc c91e6ca9 75dda1da 26569048 b426f638 903c5743 30ee4e6e e4612395 86a3b160 104111a0 a582f307 bb6a3b03 3b9a78e2 6a629be6 8ef0a06b ab2d1a94 fba70405 ee61daf1 83beb58b abead9b4 f99c8329 9091141d cdc86148 3b6d18a6 ce4aa370 d0125dd3 68291892 9a9b7873 b1357148 d564a3bd 6b6ce64f dfe981ec 7b941d46 4f0c5df7 e6dd7f84 30d952ef 0bf1c0bc ea6b399b a9c11c62 8d967a92 0fa32c51 7df2b12a dd9170fe 9e937140 2e54862a b51ea987 0584574b e5e8f772 a21436cc dddc15bb 17abb3c4 d0447d54 daea3c48 3597b986 d26cf1de 7550fc69 3d1b0d17 bba71db0 da65380a b7d193a8 5140613e df82a961 df2f58b5 50165722 aa4ca19d 143e2a02 4e37ab79 d6bf2905 a94520a4 0e83a7e3 823abc0d 9e530a22 dd2267b9 21c86267 097eb50e fc8bf5fe 7b574b0c e8f2ef97 e8d53989 dc7fb6e5 359797dd c09de496 bb251385 3d084860 4783815a 5a887b2f 9430299e 40a74a1b 43e8c2ff 4607848b b4262e50 2fbd4936 ab2d5f9d f763bed6 abc21d29 8ed52798 58085dff f3c14a04 b2f7de08 6c0b7c68 bb3901a0 1cb5d43f 86f9d059 6831285e 35b6cc0b 03f2b954 89ae2637 ffe785f4 00cb3263 2f2add73 b3eff281 98c8a87b 8093f86f a97ac1f4 c0de7d7a d94c1f77 af46ef9b 6feecc24 dccbdf2a 9c443f11 76015273 38635c2f 7bfb6828 63e49b45 c20afc06 4d30a17c 8abf7f47 ae6b8673 64bfbebf 017b0d1f b8eba33a c3211c36 b5fea279 775163a8 29c55f22 c9c09784 85416f11 0afd9d6e ef13de01 8f6b65d2 3e222c03 8c8147f2 7886d0fa 90b786a0 93443023 30aa44f3 a0a0480e 5ad0df24 6fd9b8a8 e3db4957 a711650f 40327140 6246544f 4870f44a a035f3f7 ea597467 c42e9727 46d9583f 3ba9589e 75607925 2dc9f5c7 f5d03b57 d5a856ac 338eb35c 5e3ee116 20f1536c 135f06c5 a05887b1 82cf8038 30e91ce3 47e383d4 12ef86a3 ecb5599e 0fa2f053 9a26dc32 591e6e38 72f427ae db544208 74765187 a1d4334e c7f480f4 6aa71a59 34485fbd 83ee841e 4eadae22 a9cd2f12 809fb8b4 fe98be26 8b1c9e71 c972b74a 96d688db 20603848 49a05db1 b2d6f47f 0afeb183 8beede5b 42c019f8 269a2593 20325454 42be842d d1e7f884 db2d2077 fb65f153 0169ecee 544210bc 5388fb3e c0d99692 136f706e 6f923d8a d08c8974 b8504b0d facc6eac 4232a6fa cae3714c 062aa8de 3dccbff3 47cc0414 12699512 301821b8 9fb53ada 553c07ee 93f79d4d 5acaaa22 d52313d0 0d4d6546 75a8ee30 3739b377 196938b9 c2279450 87238295 b987d50f ab778685 35557dd9 8a974ea1 8aca72d4 3d206aeb 6c7e8b90 9c455404 18573b34 c834fec6 44d21409 3894fa43 b57b7e57 e22be4fe c239317f 5b04c5d5 6a79a376 32ac41f6 0967462d 1bb153da acab758e b4de5dc5 ac2d5967 ff622904 3d1e1af4 039ba7fe f08598e7 eef2aea2 157fd814 f9e49c5d 4e900dcf 3822180d 5e97af05 5d641407 fbe986ee 10011c17 6b16c6a8 d6626c4f c6253bb8 b29cebcd 9c35c7d5 97da28b1 4fa7ee34 4a95b5c4 003a3706 ee31c397 fed9824b 27408869 29154c20 bf0ece1e f4215684 df93746e 7c646795 79f1ac64 9e6bbc2d 672e7be1 d49363dd e84a07e8 9f9d9551 b9db4c32 35a34c23 5e6594af 91923ae7 c639ef41 91eb546b 91e034d6 6d7bfe5b 0d033927 cf04ccd0 1ae39b3b 084de89d 75e196e6 50548510 a2f54ad6 64d58b29 7755bc83 2ccd39d2 29a98545 41b98827 fcd3401e 33db8448 55c10d2e 612ff65c d6378399 a7663d3e 9189670a 769f37e6 07fe4219 00c2643f f7c97045 bee81351 b41a832f 6290bbd3 ecc9825b 85fcf4c2 bb0f6667 5e36e7d2 1afa7b68 dc89a042 1cd8f726 acf1dd4c 9363c713 8e14148b 5ff5e537 1f522692 e6a5f870 e43662e4 c2f8d95c 6d8d4d3b f43b48e9 aeadc1ae c37e9aef 63b861e3 2ba7c726 d4711add 36ad92ad 358dd0dc 2f77352d 1193fe54 f315d822 00242834 337bbb6f d30ea66f 30415afc c20097e5 ad465ae8 950ba8c9 cf0916fa 9d50e801 eecc5c1b d8156145 a314c6f0 4244cc95 8712940a 851b88d1 44291d66 5d97a1ea 0efca9ef 2827f046 8ea00d21 03099cab 005781c2 be73cc56 774b3b6c 85f7586a 1b2934ab 5805a755 c8f17b41 270a6983 44bef6db dd41a0ef fca8697c 23c09b6b efa5a16b d3028037 10ec3b34 ea699225 844c4198 88429b6a 4d0942a9 dc283440 d311d3da 63784eb1 c6ab4fbf 597724d8 a930e31d 571259f0 0e64acdf f87edde1 3fd14f3b 407fb492 a0f4a87b bfd4717a e3c99966 ce6c839c b9390448 d4f2c9f4 5289e05a 859aec04 333df469 bc676731 d2a6d847 9e2cbdfb 1ba12a52 384a7b67 04545e2b 5ac29f1b c2bf8964 884a0a54 82acd3a0 74f1a4d9 91888cad 1858eeeb 63f0bd01 82b287e3 7eb837b1 3ceb300e 0a4b2611 8dc5c6a2 b74a986f 1251be1b c521f46e 8d87072c 4a6a415a c2616de6 dba872bd d4128508 55ac8ad7 664570b8 5a24ab3f 01842e61 02ce1850 4bd2b9b9 04b13b49 efffb174 c44c6785 eb3d7c11 d7a5646e 0b41e73e fc7692a5 3892f431 4a05b1c1 313cefc3 44c60b06 dc7adf7e 8754b10e 601634e9 33961b35 1740c28c 7d38335a 536bf181 2a3466a9 a66532ba 8b011829 9aacdaf6 a29e2a2b f90e99ee 8cb31cb3 b2db2e4d ab098073 ebf5261e cb03d7fa 9a74a7af 0df48d4b 33024ece be56f535 8cc4c6bb b12aa48a 6d31bb93 9d09a6cf f1582f81 2307965a ec4e9bc4 3a053684 ca3eac55 2a03ff1b 143c16a2 8da4f3f2 7514ebb1 aa6c2ec0 dc5622b7 ad77ae49 9eb0854e a5d65821 f6ea9293 9c4eb1b3 7d23842c 2109ff8b 15ee9571 0c0265a3 d492f998 3980bd25 e089f3ca 72049ca0 667c49d1 240cc62c 97057b5a bd52cc9b 13d3d9b9 08585b18 7de977cc 89b8c228 cd146216 a814fa6d 01d70716 3b5d7705 4b434910 c03554df 1f351e74 68162702 36ab5942 0e7caf00 57535d56 b2d3602e bddffa2f 1c663d06 9442cb9e d895c0c0 234e2871 de2f84b9 a29d39b0 126a994a 633ddc0e 428633d7 dbcd12b2 50e356df 6730ba5b a9184a18 d6c98820 0ad9dd1b a84432d4 52946a1f 17ae4fd3 bee5f71d fa070ebd 4e03d47e 526d0758 abcd7932 52d45611 6e8f2a25 22dd4404 ec7c6e67 95eea8d5 0d2f9ab8 fe56759d fe2147e5 c4d34e04 5e567f3c a6237d19 98a8fd74 a989b8de 5e39faab 13854c76 1e26e929 09bfc591 934b6eba 03249783 e46520da 2df7a16e eb2b3b08 1b8f6f78 318dd62f a0550c93 7aef622e 8f3e20d1 63f05e9d eb08d588 aa9bd90b 77ed2a88 1ae5f3eb 95bba3ac 25e8d2cb f93655d5 ce29663f a1da5764 a04979c6 b8761699 4ccb6d4c 97fb4238 e0367c58 da7f05b4 684278e2 1853e1a7 48dd7dc7 4330bfee f075c9df 7ed88f49 256c9e5c 7f27506d 3ee64a03 5480b0f5 5d2721f8 ff52322b d0d0e9a3 3e925150 78db2b0a 302930dc a9238008 b9ab579c 25581a74 8e2a7784 b581746f 234cbcb7 0d6ba9cb 668e9154 8348a483 21890727 03cadf01 07619b85 f74d7470 165747e3 a7e9138d 8e90d003 fadd6785 a189a13d 2c6f00a8 e3920f81 837b9a1a 4014b25a 99bfd032 ee8cea8e 1a4decc9 8dd51371 a080316f 82ee6d5c d0f8ac9c 0059c5ed 2cc37529 0df1bd81 a003ad7c da9f4887 6e279384 53afcaf2 3a6401e5 c2dcda67 26b1d462 75d4441a e7e90e0e b1d99c3f ae4afafe 6cf616f7 6ee40c97 39633329 4e5f2bb5 95a507c8 ce688421 b136094b efe70a7c d00284f1 47bf5f60 7163c3ea 2b2a9c7c dc247da1 77dd60d2 92bf0245 12c97f9b e2eab912 f7f1fa50 0d503f52 795754a5 7907823f 912db76f 0c26f77b 63fb371c 347bd632 00684c79 eb573d82 cc03d79e b1cffb58 fc275247 345bdeae e50349ab 4e289460 ed532b48 8b94ccef 4b286e3b 9665bf3a 1f694697 c2a93057 50efaa10 be2e2735 eb710768 09f9a91d fddc38d3 95826140 05cdcc71 60f53507 4711df5a cfa1e3dc 40dae9de 9a40f6ae e163975e 4fecb0f9 f8da118b 05a48fe0 20e19826 be694bbc 1ab08bfc d6145d2b 8e080619 605f208a 591a1312 b5b07a72 91622109 148b8c43 8f5f5e34 ce9192e3 d694245e 920a3bb4 713931d9 7010beb0 6615b2a5 ab6d1d4f 5b47a4bc a4558efb b3d9fb67 6399fcaa 618b4fe1 c3e35857 71bea082 9c7d58e1 82ef3cef 3b3e5908 fcd465c7 d52640f1 fc050973 0f56edd3 2ab1a70a ae2b0bb1 999b0a1f e54b89e1 32b48f19 fed0746e 46000355 0cd5a86e 72bb4ab6 7ae9dc91 a015f63c 2dbbbb8f 80d57f74 b5dde78c 67812e13 ef66d522 fef10ab7 4f5209e5 c9579282 a5d12c92 538f74f8 cc3d3c20 7637204e ea0aeaf4 635ac61d a05e81fe b57855c5 a371eed1 9e297cad 5befc243 2901e1c1 e1bbb292 cb6812ff 62ddb267 ada8c2bd b35c2189 c64a1ae1 f928feb8 b973e255 47dc4c50 e4d0017e 61cb42ad 4331ea15 368bb604 f4bd65ec 7d0bd7ad cf2c769c c9f41f8f 0bcf8860 4beee354 5171313a 0fbf81be b7027a29 bbf2b2df 0d1bcd13 95da3049 7402147a fe6f8eaa 745c84c6 251ab2a0 307122f4 140fe298 9869e030 317d205a bdc2894f dcb9edab 05939e6b 48d74957 0c5adf37 b6568804 efd85875 fbbc85a2 36771123 2dbfb45f fe1910c5 f1e08917 751c0b34 6f6a49f2 bb8cb64e a78579aa 70cbfdca d7cd1777 1b918cef d22d013e 074211bc b0235d11 3b2ee16a b1f07049 8bdc97f4 9bc65bff a0e4f4a8 56b922e6 e30563b9 b282d8dd 1bd7776b b5b0c1cb c8cc2dbd 5b792175 654efaf1 e84c5cd2 db800cc0 315275b0 e629ca6f 0ecc9305 34180d5a 2ef83131 a5e3dd36 a6f763f4 7f8e7f67 c2e5c86a 6e2f7fbd 3b013b29 7271ce86 84509e6f 06be59e8 eb96aeed dbb5ca68 eaa093dc fbc1e2ad 4802512b f172b8cf fd1e5f56 36eef49c dc3e64ed c2afeed9 611ae311 e6abfa45 b1e77710 af4ca4ac 8693c20e ef161fba c5193cd6 2f118808 cc316e83 06306d00 9b55a6f6 68dee393 e44419d3 90439681 7a0ffd0b 47fb0d65 11cc6d7b 669787b2 dfcf6cbd aa9e137b 1fd5e0ff 6d32600d b7796dd1 f5afffe3 7d991782 04160494 7a83c7f7 f9b3cc31 f88e75fa 9392b6fa e53c687f b2c75e52 68ec8da1 4ee0a55f f7300b47 a8b27977 30b94e69 f3a900ed 3625bbef edea2fbd 4b2fb781 52a6fba3 51be2a5e 23fb52f6 6e9cc9fd 97a4ae44 d01c683f 43905935 0d4aa806 041fce33 2b8535fc 06e093f5 6f91da9e 8467be84 3c6276d0 a7020262 fc67d09c b344b60e 5470bfcb 0c591526 03b6bc35 6b348a3a e9cd175f 384ec1d8 a97c464b a52d8ecc 11c297ee 6dfdb8ea 51a8e619 62f0e2af 762a5b5c 3faa4999 0b142de0 fb655886 15b76c4c 299e9eac a0559142 045550ea 62e82ed1 c924adbf b6688160 bd7cf942 5f2b0cd7 81c4aa8f a2fa8fc6 6d88a290 a269e00b 6dae6fce ecccfc6e 03f78fdf d3b0b66d f1bf3853 a3c73f5f a68ed4d4 f33325fc c84157e2 b23694a7 d187cd0a 57daec10 2adb436d 7e6eddc4 01643ebe ea510e8a 22bb2a79 d971bbaf ca7c0211 16f3e4b9 febce253 fe7ca0dd 1c8b70ce 8f832de5 128d4c0f daab2e37 bdc2a228 bce0da90 9142a271 c8c837cf 34e76b4c f81aa766 d634ad8d 90f56451 0f44ef7e e98bef71 b0062c7f db97274c 356058a9 80aca1e6 d811b03d 7dbf97ef c35b57d8 d2300fb4 3539321d 5d4b2634 6dd895b3 2f36f34e 503948a8 2f867e8b 9b14fb42 0b11a87b d9c9c3f1 acc9a0f2 05e17e50 e2092b87 555d8475 2acfe162 14424623 d9bfb9cd a0ca1245 7878909e b98bd0bc 3f3580ce a0963e89 42b07880 b35433a7 654eed3c 6e692157 b3f0b476 f85ebdeb 15c75f88 df6d8a90 877093ed f5e8d10b 03b4fcb2 43ad4608 a4764ba4 ab1e755b 3aaf99f6 4f5e0209 340175a6 435fe2d6 a2544b0a 05895fbb 1e6d9a29 6aeacb98 cebf1f07 b9d54385 c650f764 db4d201b 5f52ae96 33b69ace 1647e9f1 193d1d90 0fe80036 0eba1760 00743077 297c986b 1cb6bd38 227ad3ca 45a36e58 eb8fbcb3 2e501cf8 f6bcc36a 829c47be 5a957dd9 261ecdb6 263fb706 2c5e39c0 05c10681 101d51c3 a335af83 2183dc90 f0cd70b1 1c34cf54 3392abc9 0487e8d7 1e78ac92 73081010 3a6b2f88 685bd0fc d19ccbe0 d01842d6 b60878f1 bb3db433 921abf77 c3e15003 32c8b43e 0ff677ed 121acac9 92081f59 a04af4c3 d5202111 b7f26226 27b642ef 86365603 b1bceec5 dc2c85cd cf80bb6b 8e2e5caf 51a2d18a 2b0d0410 55215ddb 7755d3d9 3788f6d2 45498b3d 122029b2 abaa8ce0 dd82005e fe20aff3 f7974fca dc751182 37b18f1d 78774dd9 92624ccd 3de2072f 9d351eb2 baab9a3d aeb28a46 3702b055 5d24125b 85318fd0 9dd7f00b 46a0d90a 57afa904 7331258f 55c08e72 c4bccfbe c88420b2 4b544a3b b6c00967 91d62d30 51428ee6 67f0a95b b8ab4da6 894c4f51 9924831b 00de9fa3 450dd4e9 eaf5f00b 8a62ef76 a23d0e5d 635b8b39 a84a59ea 891a5df1 543052a6 e3c1ccf9 1deb6d0f 5b848d53 37f03d13 61b73f64 6f1b7ea1 43a0ac5d 3069d2b0 7294cbe3 5142c4b8 6b05387e 2cf6cf1a 014bff34 61beb070 4d698e17 e6741bf7 8d8447f3 4268613c 37c26afe 942e343c 6e5104dd faf44516 dea640de c2430c5f 7dd4a4ba 5034f54d d2d227b0 f1b172f8 6d7ba1e4 295e4b90 f5e67ccb 7aeae7e3 95cd9d9d af4347fa 4248ef6d 7ca2b766 5f1c535e b74946fc 1058426f adc32479 addb15c1 59f87f4d 99d8c59f 0cb86d79 ae3f995b 2a7197c2 3dbf091f a017e8e8 162bcd1c 47c0abde 836f9c9d 75f2d703 ac4b775c 80f50f2f bd5ecd82 5c7e9aac a72eae29 b05e7db9 b9975394 80e63b94 9382d152 2211efa5 da332cb3 29471903 90581afa a36416a6 747207b1 24d4e68e 9813d7a3 e55f1fdc e2d44d0a a8269de6 94296ac7 178943ef bbc4df58 82555eb3 16a210f9 397c2f1d 5cb28c04 62f1ca78 5084ae17 14f75a28 a8c33874 fb2023a7 9c517dde fdd4f7fd edc01e1a 68c961d4 d7c8d86a c8bd4e5e 6447af58 01a2e1be 13a13756 dc29796d e8d03244 ff0af4e6 fe763a7d 61e1c552 50600781 b2bcfde7 31b390c8 c26e5140 9f72154f 4aa2d1e5 c5648a21 c5625151 1a60d353 cec75b76 f414d846 8443236a c00534eb a1716c39 863dc66c 7cf2b999 67766c59 82e13385 b589eaca e65837ad b37a86be 75093202 a392bb01 874025ed e50c8294 f6455ff6 f9cc0bfc 07304307 70b51438 f5f88ab2 a4786ee8 ca2b14bb 3ea09ef4 60cc6036 1a9e7abd 43c27fd0 91a076c4 d8ad4af1 1645dc2d 21dad034 7630e94b 9c9c509c c1c53476 640bcdcb e3f2bb95 fa8b571d 4c340a08 3bcfc33b 36f39bb4 f8c7063f 3117a0c9 d7b61515 119997b5 d772b5cc a508c818 4cad3d86 177ac34a 846670fe 178d853f ebb81859 c5ef32e3 819c78ab d40ff0b2 6fd2cab7 5f3a842b a59d9c57 33dd8d0a b6ed667a 06bc4214 d6110d33 b1f80f58 8dea5a9f 0c97ef69 92456226 35a549ea 81ee3a7c 9a6b0462 b8fc9d9f 7477f70f c3801bda 5d22b57d 835168be dcde3337 4a4c9bd0 020eb4a9 babb3288 2e3cce27 c571ca8f ed2516d9 28e87dbd 4149daca 9a32bf7b 62fa0b1b c3ef27d7 6c6fa0d3 8204d648 df312e6e 4928412d 193590d1 36d6bfe5 d3450a3c 8f6351b2 2e934e22 7a0bd7ac ef7da22a ceabbd1d 35c1acf7 32f807b0 d41c642d 38aa5b08 faed7a5a c75b09ce 657fce23 c5e9812f 8878525b c7fcc044 652b12b8 ce8a3eae a9723fb0 570b5b1b e265232b c9cac3fd bedf534e d05071f9 bb9c2cdd 8c26f7fb ef55de6e dbb0e847 cda26336 6d864579 8a8e3d64 5ef7b714 08965bde df8f505a 7d053e2f 1a3e8c50 69ab8b7c 772bf98f a80847dd 72fcb01b 1f80cc43 eefb6add 6db3f547 ebd6e311 b3d58693 f56fad58 39101bfa 51d1c4ce 11d5fe36 7f6c65b0 ee63f935 7cfd3175 9ecb1a5f 02b50126 8fa326a3 b9a4634b 78598167 5fe49aa3 5822af1b 70a2699e 8533bc8c b791d2a8 bc12aed3 da5d912d bfd241f4 9f6752ea a5718bcf f683d3b5 1b6855d0 59606b12 cf0e8dcf 0be3ed86 05c61730 d2bd6f26 319fd14a c5ff45a0 70c9ea01 799efb12 804caaf1 0f4944e3 0eb7cada d4688135 c907e01c 87e78d5b 64e8d532 f2b8e339 66155ad1 a1c028ca 220eb0df 98f0f103 225a8da3 6f77ba3d 33cbfb91 9440c9f3 3200f98c 2240d4b5 33791a2d 67af26d2 a3e543fe 335dbfe7 f5823148 eae941f4 2e450a73 16f892ef 54206f8e 0c139c87 faaff158 543a7cbb b295a68e a5fce24e 9e2dc2de 06c68005 6b830385 c4bcdda7 509813af b7960921 25c694b2 c0f4629c 83612fd3 300dd88d 72933aa6 6f96140c fb0f70e9 7c2f78e6 f6ec9ff2 f94241fb 63fcece9 d818b402 d5cb4a59 81a2ec2b 2d2a53a6 25de8222 f987b1ab 8711269f c7de5417 69934cc7 df693b17 a8f10832 99fa992a 65ebf607 2f4bd036 367e8529 e5c91214 679a774b 9498d7d4 60bf0a42 bae67f9d 4c8760ac c305f895 c6127edf 83cd04b8 906de612 64c594b0 33c2e6cb 5c2cf1b6 c7a17407 11ec55fc 207c453e a1b9091e abc3fc52 885772a8 4e435e1d 221284cf 569fb6f0 06afbac3 b0594637 19ae7c90 9921ad8e 27cfcace 7d482eb6 8c31c863 8ca75007 cca51526 12dbc390 6797db4a bba07a71 b0981df8 ca1efbeb d2db98ed 5c3295ed 807a6fb5 61305dc4 f0091384 37df7ba7 f8d7e0e4 5a066669 2bdd9631 7b3d8aa4 522f4aa9 057d1249 95ca8666 6b971fb8 845190e4 fc7d89d7 9682abbb b404e8c7 e05e23cc c7ecbc68 9c24a81f 0575a4dd b293407b 3620ab58 bcd61c83 ecff413d 7bce5439 f2384550 3fbf7435 6ff113e1 63ac5c30 788192f3 d6df78a8 2854850a 5fb46297 adb2ebec 0ecba287 74b0698f 1b930f4c f54f3265 e15e64be b280bb36 da62a47c 5452a5ed 0482bcb5 72d11951 3edb2bfd df638129 e52cc163 967478d0 bfd2cd94 aa1a4358 28ec3040 2ff435c9 3a438a9c 31319585 3fc87197 442964b9 8875010d 8804e176 febaad18 6c135b12 264546ef 763f556b 8740dc97 87751f46 0c6215b5 7e9aad9e c09185a5 327cc6c9 27e78f81 96e91476 59e951c6 32030cfd d804115d 6fe5e6f2 ca09d4e6 16b1af56 23dae53c 93e96a6a 8a31b9fb 4bf1ee53 c4aa5fd4 91436397 124def43 9b80e35b 547388b7 a7b4a881 c5b311f2 9b4c6aec ee7856bd 5a456729 6fc8b886 4535e3fc 06213cf1 3a2882ca 2076370a fce5135d 02371b2d c8884ea6 e10d3fcf c31c1b54 8f85e001 cec5052e dd62b447 5e2f917a 70f88a0d 2e100739 22ee1e73 b0067193 c9f4969b 87ed9cfc af9c5a56 39e6c272 00b2b64d 8871bca4 5101ce07 9c1d5069 a4d568a4 3a273066 20d1ef41 3a8202c0 d3205444 93c229c1 bb2d7544 2388cbb5 e66157a9 9d37ee9f 60f11958 d688a4de ccb4911d 413694df ab85c484 f68c7067 3b008917 631f652a 5fd5005e 047b7a9c 1caa1f7e 65891aa0 dcd2ea0d 90d272a0 ac748893 60de63ab 45e5b0d3 00f988bf 719ee0f9 468767b1 bd852487 5439f618 82b8c05b 0b034fb0 1a8c2d04 0cda37f6 cb369b7e 2dc0bed2 294362ed de916f56 60b9aa19 52801b0d 7702af0d 1d9fbbc7 a8f1c534 5062d24e 6ad77c36 677a6fdf 872f7f7e 8ee3a136 521b7ec2 68d1a07d e8cd7be9 a7b95e77 d7faf19e 85b26283 65a4ef84 e2ebb473 b170b3e6 86f53e1b 1271b3f5 5102740b d63f9d15 a8248302 b311ccfa 8d095de2 b456d60b d8dac080 21f72415 84051c07 8210510f fb10c0ff 8c73c1d4 9b386e62 2f62aa83 4734b4ee bc41323f 535369a0 33b24ee3 9d1cca9d 88bda265 5aeb1b27 dcad8140 b94c6a44 01851cb8 31f71e5d f17ab099 c86654a9 fd946e22 f9ac1032 26ef9922 bd6aba17 d3f406d7 277449db b8c4fe13 241a6c4a 9f442798 81d89d38 f9e803e3 a9990cfa 46a73de2 80da471d 6c5c0e08 b9198225 973a7995 50f99b0b 2b4b6465 52da8af3 e359cd01 a25f5584 25581eeb e2119bf7 9c30a2b3 bc3de1e9 dd743d90 6dd2535c 7ff16a17 7f939a03 7f1dd5e4 4e9c9996 48c06e87 238fd8c5 2fc3adee ce1b55a4 d981ecc1 61ca3259 2e897a05 1dee2176 e9b9f07f 42e41962 f0b8a710 761d15a5 3c667c1c 70d7cc97 e590823b ecb3c630 00ee2563 80d7bc80 eca26bc7 b7081d56 34273d7b 98a8e6d5 9fe84f40 1216c8dc dfeb67c6 6276f8e3 df77ab34 463bc9e4 f44feea5 d91763d1 218ded51 8ad414bd 1e2507f3 08d8507b 1cf93297 539234ea 25041a7e 20e1a6c3 bde0b6f4 7485eacb 3cd858a0 67add24f b6f365c0 52712d66 e1498de7 07c8368e 561fabe0 70aca94a 20bb734e fa939972 a9baba1a 48b2738b 2905e08f 786738ca 572af4c2 3b009af2 d2f30d2f 97bf4748 de4c7c64 e4641c19 0936383b e243005b 1322fc5f 69cab818 6336519a e72500eb 48272591 8e1099a9 ddb5f795 3611fa0c f5040dd5 72fd1880 8bfa43cb 6e826bde 3c00e78b d05ca3cb 4783ae26 e84c6c4a 5a95457e b16fbccc 6977c669 041d6529 2f433b72 199f6afe 937af2bb 2e6db48c 3dc2a7bf cd3e8a84 c920b6b6 1649e3d7 16802b59 be5a834e dd03232a 00f677ba 5ebee7de 8d47d73e 5bad518a 7f608f72 bfbb6601 06cd67f7 32a22be9 dae221d1 adf05dd3 5640cdfb fa07c761 adb69b52 6a0d5770 04bd3f43 bb2f6cf7 b389cf1b 9271e5fd faab4492 df5d63c3 a1546f8f b4283541 0d9ef721 fe69d693 f6573cc4 d401731d 106b6110 a6071094 08d32ac6 17531228 913584ca 37428acf ffcddc8a 87e1b955 a53e59d0 afb6735b 9580d07c a9e40d92 c615e8c6 b87cb56f e0182ddc 11156215 653e6e88 c5225a38 88c7c23e 5d7e1a88 6b90f6e7 fd7b7ef6 efdba33e 33f35e94 b5bc0536 c9323134 109e3378 7c108fe0 c16360e1 080c7500 50f0eecd 5ab3c0d8 874dbba4 45ca323d 0d43474c d607b5a0 ec03c229 0c811ce3 27d3eef7 28330971 d2adc427 a63db8a7 00d25a1b 53b9e75c 1307ec40 37d887a8 8744beaf f05f37d6 c6177730 df9f557d 255964bf 1b716f90 3f64b968 21ca7ab9 acb38398 f9b5023c a2e5c1fe d6b9a25a d924761a fffadd32 2c8d4c3e 49b26caf 1bc1045b 9e4e0344 19edd095 c9ea63e5 2e7dacbd d2f17580 6e181709 cedf6a37 64c64616 162e6ab0 c42c7634 aaf52841 d5f8552e 13090f6d 575e5be0 9bff662c a94d6228 8924bc74 889c5d97 ba093a87 d18585c9 01dc3b81 cea8f9c0 04bd35da db5de1f7 c17abbc9 aa38ad71 2f50f2b1 f2751808 410fdd79 e7a07b2d 8c0ff507 6f860dd2 89dd5640 34b97082 bb5a125d 2cc81138 38effdcf 4db7d7bf bb5b6639 710ba5e1 d539579e 71f92485 70aff3c5 9a31ca04 0ba2c6e3 33837f58 d4c97903 76ba5c7b 8081a2ef 3d96760d 7ad7bb2d 4e4e45c1 16d76aa8 de4564c3 c59f920e 1455db7a 217433ab 43242aba b4da2b83 82f2f51c b6523b08 f9a11689 1a983961 e4aa9b89 1276a2ee 8555f7c9 f94680dc cdc36512 5a271d12 f21981a2 337356fa d45d03ce 7d359526 da86eb97 9ebbcb26 f3a82e10 1c4c06fa a7d65e57 803b3ae8 3f5d3419 fe7839e6 3fb0ccea 4d4ecda1 42152785 e51751f0 0c86a6ea 314a326a 1408f7bf 5da26dab c47606e1 bb307467 cd41dde4 e53d427f 38462c61 2c908376 4eeeb607 dacea5ba 0375201f 1ecc71eb ba1a494b 9cb20fc2 ef007416 3ad7aa06 f5981ddb d1d6455e 49740186 cadae0f8 1463984f b97ac494 90f1a7be 99b45a90 35e0bb10 18fff567 01f97bf1 22b54e87 b86e2e1e 089bcfed 6eac5721 f1da11de 83384cfd 59bfe9a3 60a3e712 65caaf90 ca1ceac3 c681114d 2410ac4b b799f9e1 e15858cd 0b679bce 4980781e 2319c0be fc52f404 a66bef48 40b6df90 7329845d e66b20f1 828c9ebd 2c97b4b8 4db2de41 7a0c9251 642c18a1 6df103fb 573d5caf 3c84a288 6325420c b6e9b598 ffea1267 c05797c3 57bb928b 8f900b7e 0b5192c6 0e190d85 ce8e0d23 793c90a3 38f5644e c6508d4a ad4c34d5 8cc687da 78400364 e84aeaaf a93248d9 56eabb85 954ceb14 91dc5fac f207e65b 6d5693aa 1a34234d 4a4aabae ae5a9930 4f2aa4aa 0099c538 ded87c4d b1a5fd78 fa505362 21751956 af6cabb3 5026293a 8a5f79af 2ce35bd5 8efdefa5 9ba069ff 9b3aeb97 f7f02207 bca158ae a68bc6dd b33baf39 e2db7506 e30103b4 0029b268 bf2a3523 ffc8d214 1f5fee43 006bdb6c 6b6f81f5 a4a58d2d f40b30aa 79350c63 1739a09f bef5ba73 cfd52000 3734027b 5c129f5b cfef9b36 acac8bc7 96c306b3 5bc03855 17555c56 ca3b9a74 f3e21977 d8d1a259 527c6cfd 78cf238a 7b48950a 1175827a 0a6a6307 e53a39ec 95807556 9aa35d79 4c9b750f 9da99bf1 c5cfba37 053b2b6f cf8474d6 e510f6e6 3c4fc3f3 0c3d498b cc2c7551 3ebfb84c 915b2b4a 21f452ff 8747fad8 1ce63fa3 e093cbaf 76147ec9 5ffb39ec ec909055 88796023 bacdadf8 9b7d6c71 3424beac 10d9af29 af2bf4e4 44e744a1 9028c1aa deaed3cd 6c4fa83b bab0b591 c791eda5 9a02d90a b0022024 ea598f86 975164e0 9c35d4ff 37fa2c05 b1f85fe4 4b43d6f9 46f921ab 455fb715 f1eddba5 01b07f9c 6cc23564 81862379 94ba6517 1a9c919e c2526138 16e3cc9d 4b010f7e 6f11ccb2 3c4c8beb 401ad926 0cbcb601 f7eaab42 7cc8569d 3dc56fff 69ad1a40 531e5e60 9a751170 fa36ca42 fb4d394c 7f857b3a 1a2f1452 bcc4a932 5e7f1e37 5e3f2e5a 9d434982 92a1ed06 05d91ce0 f4fe057b 4f982910 3a59acb4 99f13873 c8671a16 a61f9fce eef1920f 333ac6bb 7858ec8d dfd3f5d3 b8f8bad3 2f9c138e 07bf7883 5b09d90e 524b11e4 97c31498 7c08f00c 509da94a 807b8a80 c4eb82d4 80d73b11 2fde201f 61e4b9f6 b5bb50f5 5a89c66e 2bc79080 918eb6a6 726913d6 78483661 8dd01ab0 3f19345b 6236a292 5ee0afd2 aa0b671f b7fdc66b b4856dc4 20a1feb0 0efc1b2c 2c35694a 7f7711f4 354ceb61 68c31124 9ef52d68 66a128fe 87f93766 6028e30d a8766ad4 be141638 b9950b95 276f3891 9655b936 f13efc87 e8a59d8c b25531fb 1c2282b7 fcc4122a 931dbbdf d99c8025 2b813af5 0814132f d4323ab4 dfdefbc1 16e65bdb b5866b28 0e6241b2 00a6a11b 4189a979 05844740 65b50326 bf66fbbc 201ce9b5 21402847 c1209dfb 9c683d8f bfd36925 2cd69ac2 0377be92 15e9ea7e 1428519e 34c5f5dd 059f7c7b 22af1484 740c1fe6 a98b8e27 9545a513 6487c989 a95dacf4 fdd5633c 7f2e1f97 f1215c0b e822cd82 da8ad952 5709db30 25f13259 b7d9b3b6 bea24f90 11b3f1f3 7910417b 13aa6e84 cb3c129f acd9366f 68361da3 220dd054 1fc7492c af3186a4 6e68babd ee25f39f b8b01910 663bc4b3 86327a84 23d723d4 cce68937 3e755ad3 e413a893 3830cc1a 0580b4f5 ade9b034 e01f4878 12dcd6e7 df61857f 9c03aacf 2c714cf2 815e0505 3917653e 34e802b4 6dc5698b 7456a877 26cc7b2f b1bfaab3 66ea177d 25407dca f5293600 f6e0e9c3 634d331b 9871a018 df5c137d ce0687ab a12a1a05 9ecb405a 6937da53 18739cf7 ae533cfa 2a746a24 e938e9c8 1324829b 62461e46 1bcc05c4 c76ecb82 2766df55 bd6b329f aa6cd3ad 7a5f9c2a f1d2d395 1578824f 0485871b 1f4050a5 38d9356b 5257cfa0 0c2e4214 26fd2a0a a5ddf49a 67472587 49b883d9 ea329856 fbfc463b e37187cb f654a074 73bd791f 7717f0be 1629f1ff 0759331c 63418540 daf1c0c8 f1b142f8 21ad2ab2 6c30d43a beabcd93 8394c960 a0c7b7fb d48cbab5 70d04ec2 58e403bc 995ec811 1eeb26b7 06f63d7a 276e740e fc838e0c 0ee3fa03 2eb9261b a7656fb3 3f9eaa6f a658b92a 0a5ac4cf 16d021f9 fb7d3deb a8b64423 ad25dca3 6bd5ae75 13011a27 b0fac32b e0dcf6b6 eda8346b 7fa87d49 220fce8b 662c1392 72ac3c70 b41c4bec d09be960 d65b160b a4c76f61 e8acbab2 b851c108 6eec0bc3 8eedb90d a2ebf61e 48b2b604 6596064c c7aef688 a6ddef4b b3b2db46 2e459ee9 831e48c6 b3ac38e1 2a214752 59bb6299 6c9c7e06 ac4791bb e19a43ec a1a39cb3 09110699 2141a9d4 a29ff504 13b0c88d c783c9ed 772a18c0 aa9f3f9a 86349294 2cfae702 983f0b48 fb36adce 1e7ef982 1030f012 9bb7eec3 f4831244 22411764 9d4ca048 eaffc1ee a3c4eeff a258ebb8 a37e1477 291e91ce f0a348b8 7403211b 2e7676d4 d2e32a4d da5df6ab c6c9f90b d7673308 a5289855 95758f17 844c42bf 27ec9490 d9d6e54b cd3811ce c404706a 4f2de4f0 80ecc827 4d6e86b4 485c3ef3 d41dd9a5 66e118b2 42fa2ab7 b896a33e 148246c5 7b696546 4e75702e 2b4c3a11 874cfe2e 152412f0 f280abc2 f05adc8d f49cb2a7 59bd1d99 5027f784 41d10041 6a8075dc f5e7b20b f2eee076 13f92700 0c3c6177 4869370f 21b96a4e c8984689 a03c3372 b0807f3b 08ea98ab 108c2416 2c46812d 23e3c441 10b15dc8 d0c5c89c 8acf0dff a03f2ab0 0afad0ce 60914b97 60bef5fb ae403644 532030e7 84370d80 ceaab9eb 68dababe 31e0c3b4 4e8ad2f4 e9172a22 a1d8b138 89d6a199 0f4e95cd bb013206 f2fbfbfb f71970d4 cc5de55f 03bd2d3c 26fa9a06 e1eee9c0 2a722f3a 64129d78 c785c74e 0366b4f8 63f0e4a2 a8233b76 2fb134bd fe9edafa 9bb6baf6 3f9add1d d3551f87 2e15f813 c11530e3 961a2d5f 169b17f6 c84fe8db a68d5743 cc12e26f ca3513bb 381ad0c5 b4edc1c7 c757a573 e4d35798 aacd5c76 1261681a 6def8820 e32b5252 5609389b 44022ba8 16433cb4 e0d53eb0 67c68392 f92d50c5 b5686583 3df4d329 0a6344a4 f410ab8f 185eaec7 e3c1244e fe497895 854ea8f4 30af835e badec480 59a6ca13 eba26f57 07474716 a26a6757 bf18c40b ab3f6144 df6aa882 31893806 d927db7e 649fa526 3bc8430f 223067a6 88267547 f42e2393 fbe37ac5 7dce75d3 e3f80a48 7dc0cda3 ecc92aa5 b04991a7 a3a74a5a d1ec2ff3 6626069c ce7c5f32 234ecc3a 43d5e886 63e14b91 ffd2c40f 3b12c60c 40195282 0ace9472 80a75303 04e25774 6678bc69 2a91c91d 2c501e27 fc5d8f9c 5d53577f 08ec35b1 2eb8e90c bd6ca001 2026c20a fae68e19 d9b5a3e1 3bf999d2 8f10fcf1 88f55efa 4fa44999 c19bb07f 8953e6ea e1fce7b9 d9792a86 6054bdde 98156321 616b78dc 83ff6bb6 5a416c5f d61c3a1b 18d70c6a e70cfcc8 b0a49c0c 643a4823 00838921 ee87b239 512dce52 d94e2282 98d0a902 f2ac8a79 3fd56b81 02fe1a6e ea925bc9 8871dd56 86be0dd5 118bbfa3 71ea2d67 6607295b 38cbda23 700dcd33 5c6ab085 bdbdff99 28776408 6a77b730 5cdbc83b a65bd30d 329ff1e5 77e54520 2a657ab3 6a0f8b2a 99f497d5 8bfac83a 4e923772 7cd9dd18 5d0b9156 cd062605 ff7aac8d 66924c8a b294d281 7223185d f78c656d c3f55bf0 f62d9ba3 851e59f0 37d2304f 67060df7 66517e36 07d46650 14c4a2a9 2f17b036 4e79e53f fac9df30 3e74cd72 2caeddc4 90d2abd7 084d12a5 6837e184 fa648fd5 86f0b8a7 35be44af 3fecc92e 9a511711 0ba926da c9f9bf3f b44eaebb e8ac0718 3837dda0 6efa544d 08a23903 97bc913a f4560977 d6c66707 b5742978 c454d2b5 b106b2a6 9a2d3074 220e2ff3 3a1e0726 1a90e30d 36dc7964 36a1dc14 ab11a7de 95d74090 69a48bb6 a797e1e2 3aae332a 36232115 bd4e083e 51ece6e8 14edf4fe 9426e074 f2854413 0a4c6b18 a7c9988d 94c9a622 d8d06591 b9de9a72 32da9b64 3e4cdb99 c107d8cc 74bae97a 6e76e630 329cc483 e3be8c6e 3d34aa48 4de201a6 d3740c7a 5e88a699 13441232 c565f70e 3e6575f3 b774ffdb 3f4691a2 bbed0a72 62921019 5130b421 38a4aecb ebab8a6a efec21eb f30a9b8b 019d3617 52ee1577 281a67d4 2c2d26fa 78b304c8 b4311352 058d6f6b 918a32c5 397a1ba5 12672bb4 29d53e46 52a09528 bf158f09 a440921d 5d2a4b03 c5e3265e 34f1fea0 238c1b6b 40beaa0d bd33da8f 651058f3 427efcb3 e6f9c510 4b87fecb bd1c2389 bfbcd683 b1dcf34a a91a1a7e b95e90d9 5101dd1b 4eb424d0 eaf8cae8 80406870 32a6968f 8d779e11 6fa9f84c 36fcedf2 bbca461d 1f4d0f50 aa95e34c d057cc92 78fe5044 0ddfe195 c41130c5 d00549bd fcbe0edd aed5581b f7d2052b dd054281 63de752f bec3bb9d be412efd 2e287006 d4406b89 9b3325d7 e0f1c164 eb118feb 0355191c bd10e9bd 0831bc28 3514e4cd 62d10964 d8a1501f 7b4ba1f1 e8c0c6e7 63450856 74c45c29 06f99a8f d167b069 25793a4a aa87664a 985bac5a 7e9e0a31 12dad5f5 caff39c4 77119404 bb7ffdb3 55f83662 ea61511f f2417907 71e6964c 915ae902 3e351ee1 8ef28ee0 c8dc3695 9b7b7db2 6e419584 f14f1c41 35ae3fb2 6d2e2adb 497eb85a 68cd5fff c0b796c5 90a3c579 518431f2 943f2389 2aee656f 53e20bbc dec38b76 28f6ceec c63707e2 e58490f9 df6a8533 03c6f51b 7c09d411 9f779bf7 909e9679 ed98567f 064232f7 bba0e7aa 7d1d0302 7d43819a 412ad8fb e3290765 10777a6d 33bed1e9 047039c3 74aa72af 91651098 7c8e26c5 e90470f1 c8672c9f 2cb65517 dde9c2ea 0828a73a d0cede63 dc56924a efbc212f 53061620 38c81090 7b7537f5 5da7a359 66c0e39b 255ab244 1f539c04 89422625 0a5d4854 f5121ffd 62348805 21b22591 3350a56b 033f1c5d 58f79f48 5e19b67d 76e13a13 bb8bfae0 b10fddcf aca8e20c ac57372f 60487760 ea971c36 7e0e295d cf945231 11428115 e0432d52 92c43a6a 2f982637 f6f33e00 a982836b 0ecdf953 f996af8c e3029a9f 5ca611e5 44239c7b f76a4c1d 82315980 159eeeb9 096389f1 6d469eb1 eed4516b 77508614 70b37ab2 ce2e4d73 6513b920 6edd3b65 0dbb0321 57f0fe09 88a0240b 89c1009e 2cdd6229 7c7b062d 95c2b33f bc11ac7c 4054c9e8 9cbcd439 61920e7a 54719a65 f4093fc0 c04202df fbd08782 5380aea1 02a45a06 37ba71c2 97cf0531 7852b165 65111865 49f5bb02 f72cadaf c7ca8508 fc9426ad ec69259d c9803dfd f0023073 48328ba2 ce344771 f909c46e ca674a03 6c358531 a5e73814 8c53b613 fa96634d ffa92744 ffaea0a5 cbf1d765 169583a6 d9d927d0 92aa2dba d0aa2451 39f7d608 ba4f5fad 327bc877 47e75ae0 818fcc2f 808db051 37e16784 9ba8000e 9b87581f 54598463 15959e3e bfed4ee5 4fddfb79 01073342 7e537a3d c0998beb d7150c9f 8a55f385 24af7017 6a540a91 207be7a7 eabba37d c369d0e3 2d1f9dd1 ffa5d9a6 5630ae7e 0c1859b6 9ee626dc 9a2f3a0d c7b10c84 8fbc28b5 e686c4c3 47087c8f 015d07de b264a6fd 5fad56e5 3da38215 066ad46e f0a960d6 be55674a 9df14b98 77c56b6e ff7675b1 ce7d2862 97682b7a 4fc11191 38e102b7 6995a7ef 2650e187 9c668311 221d07c9 ae35d4c1 b0bf96a1 27ae3aad 2eef7822 a8c12546 2b4875ad a8e51e81 647cf1d1 b7272e0d 342300ce 632bb0bb 6735373b a6225211 d1524c73 cc8e7328 1e7888dd 3beed238 ec1ac7f8 1be94170 5ccc4277 1737df97 6c689247 67716e4f af5735b3 b01d4bab 4ccf8990 c14cbbc0 edcdcf00 d8cca718 8fc0d38c ff5a20c9 836c1208 7f695a14 6b13199d 01328186 84f12b8b 9107bd49 8358d80c 1f637407 7decdd9e 594d31cb 0cc72af8 f4d98c95 3a9d7cfc 34d0c689 6a2290ca 2063bdf3 593a0ff9 6da708d5 57672338 1acd948c d7a9439c 95bfd737 dd3344d9 2da5c7cb 9d4ed8e7 b867d8e8 adf22237 4dc675de eeac1678 3e36f291 3b382c67 67fb480c 5869c796 ecda8d7b cd714776 1ac5f02f 4525c3cf 645e999e 4f55a746 46ad4263 e50e0e79 03f77e01 37a79fe5 cfaa3649 25cdbed6 baf62f5e 93bc1a38 44769b1f 6f61c9b1 9357866a b12f5596 253fe741 6fe0da80 7ec89c10 5209cfa7 1a7a2fd1 2bfd2980 41d0182d 9ab532a1 7b44a3c8 aea80883 eba11ae1 28f4083d 19884736 21c4a5da 76fff109 d2178004 c27e9022 bee993da d3102b5d 57884764 01aa5f85 5d660f22 06fbe926 f4690dcb 43c4c06e bf515df8 3c4d45f7 f1fbb8c2 5d6a827d fb671d5f 3435ab8b 5c5f5435 1b9178df ad0aa93b 8e95b030 1cc64ddc 3b7b288b 459336c3 8172762f 2b318f1b e763f09b 5e3e61a2 63dd55f4 ba204151 a02c6595 cd767424 b48ed3e0 3891cb8e fc0e3ca5 270e7166 a35c6f7b e06b5b34 bcf71856 2a9e1602 1df6b358 237da61d 5fc634f4 66d4a679 c4e934a6 aa7056f6 2bbc1da3 7f1efc29 d2e157b4 2e6ed1e2 c6c34b5a 91748dde f935b684 255b7372 617541ed 07b4a10a 08620b0c 92bf47b0 3bcbb20c 2bec078f 41ca97c5 0b27379f 7a52841c 62fe3415 a54d2dbf b3e1ca08 507a9f71 d72bdd71 71da9d75 67bdd926 71eeb7a6 e6ac59f0 c8a10cae ff9abb88 f72e0532 e12325f1 87f37e7a e1645db7 75f30ab7 0f06463a 6f04fe9a 5b5a0978 288bbcd4 435c74e4 1c308d32 f62d1cc0 deb0b86d 4da616a3 a9c13ef1 542bd203 3fe28a0d e37800cb fb1147b1 77a553fd 27dd225b 6d15061c 074c0120 9a0c4624 40e8c8b8 0f67970f 659481bc c7c206f4 d20ef766 7b6f5536 f8b8b140 824b068a 83a2fea1 9ec67bec f7b413e9 dc80c99a 882544c0 560d009b b3d15989 9a5cb731 c697eae8 a877a8c9 acdd777d 82439c3e 55d660b1 5aabb236 7227b7b3 74f3026d 4671913b 6a828465 129e6006 e539d8ab 941f8df6 ad1bb787 075cde44 7bffa09d 63b17eb9 05ed2ed0 1a40f0f6 e1208e03 1a0f415e 7aa6d07a 779d610a ff221ede b76865aa 0ff581b9 5fa81928 2e2d3d25 c9ff5e42 ec80defe dcdadd23 8a4f83ed de2353fe 4dea22ef e2236621 8c5b8a57 e460ddca 40192584 fb1dff88 bf5fa541 96fc80d9 d4dcdc41 88a3ec33 177d9dca c670fc29 4d31d712 5f704db5 80aead32 b87fefc9 2b0a9b6d 3635800e 3618fc09 77df1173 01d583f2 00f65682 d4ad90b7 a1448b99 3b82075d ee239c87 bd481bb1 44be7f3b 02535612 a8fdc033 33449cb7 3e3e2995 5453a9e4 ee0453df d6a2e807 105e6d09 3f63e0ae ab842db1 007c0314 336c4ab2 0a880ec4 9983d627 fddbad98 974c47fa 5e08be8e 6adee1c3 e07d659e e0adb3ed 15a8704c dc945dea fee60980 c7a21c8c ef1ae626 10e4cd6f e8ab031b 126130f7 e208051d 8d2def62 e86a40e6 7fce858d a46241d4 67b1174e 84f8c7cf fc2aacdd afa8a8e5 13b68a2f 53d8bc8f 32d731a3 dc9abaf0 2cc099f2 90bb9bc9 0ba6a63d 9d663b3e 45cbbfd2 bb53d907 197c5b9e 924781ca 19fb7cd2 18f0d940 fef7fd29 581a4309 44a869b1 b62b52ce f87da426 d6ed8780 cf9a6a4b 9e5336d8 b33b3c6c 7b8a355e 9bd65eb0 3e6b437c 9fcd3214 5e8d4f66 309184b1 3c06bff3 3dcd908c dff881b6 fd4bfdd5 80494dac 986c2983 2d389276 ae0bca26 04b7b4e0 66e239d0 f4b1e8b9 4f772518 9b39bb6c d52a2f82 0e9dd2b1 273094e2 352d83bb 9d76c51a ae1d0868 1ec74ea0 7c303033 60307893 446efca7 6521634a 92de73d8 f6302176 b784961b 9e9029da 93a93a1e 509f2c27 1bcd1733 ce5f5628 2073eac0 4ed59ca1 8a3c6248 04076f08 fbb43f08 7668038d ca5d58f8 c7bdad0e 893ff4f8 7e40d3c3 89aaae8b b4f96253 cf18c98b 673c5279 8e87f845 284656b6 6600a3c9 695d9a35 b2390be8 85670ff5 62fc6904 f2a978b3 c66482f1 fae4520e 9f4532eb 202a47c6 41ca1f1f 4fb513f1 0f51dca7 e742c3b0 f7d8e5eb 6a578be8 95883996 88113649 f086cfe8 4dbe06c9 dcfebf92 c351914a ea98421c e44a49b5 7ab98229 fbe0ecbf 5d0ee8f6 389ea9d8 12b8a270 6a44c98c 26bd8ca5 f7ce1d44 a1736cd9 a4ca58f4 58461f59 6f996860 269cc31d 77626b07 47eb1542 a10bda4c 403b3231 a2988323 56bf4c19 cbb11146 5bff6182 258a3694 645b4225 b68db36b 2554dcce 8ea14711 3dc94e14 9d8b13e1 4da4af7b 3b0512c3 4f3fd5c2 2e7fe036 3c88047f ef6b80c1 726e7048 e93bcdcb bd0f5ed9 6fdfc87e 40b8deec f3c29e40 f8dcf608 e3769d1f 6f4ed2ca 87368c89 e6d97723 dad36523 11109e64 55e79d22 76fd1fcf 21c7bb94 9399c98e c452e984 c4ddafa8 3fc6bd19 07882852 3c2ffc8b aa44574b 6f8c03e2 5cf46eaf a5301ee1 3cba3fd9 a0c05967 d491e259 a571ba68 41ceaca7 606330c3 6c876ae5 0b478fd9 2582a124 de193b00 eacc0e86 862ed3b1 defc01c7 72be1649 0bdafcc8 242f26fc a1b106a2 1ff692a2 5e0c9419 3f1f8b59 04b02a60 5461f738 9f30dfae 74d58a62 964a7fd2 2c0bbea5 fd3103f6 08b17ff0 039bf9c0 373527bb bb6af78e 988c1a2f 935361b9 f7ead451 a34ffdc9 abee875c 4e015c99 2e45f6a3 e8c3c356 45058738 4f34d893 467c5ada 72402406 163a736c d2388ee5 31697c75 86b46a33 a1cfccbe 73ca95a3 b3e33a07 f99e4444 3f11310d ae2b5d03 35b31426 34a49bec d6dd144c 3a980771 dbbb3ecd de3f6dcc 3fba523c 28970844 82829ad8 dc3f46eb f0d69ddd 709d7d90 bad7654a 79d8e523 479541db f8e0595f 0071292e bdf77cbd af44a51e 4a743a35 4403e3bf e301291a 5d778082 3f980c38 b3b3b0b9 83fbcef7 e30de347 bc9b9544 b984deb4 0a42ce3f 8b8b7f35 dac60c21 aec185b3 18b5755f a21d0fe5 fee5ad2b 85d10587 6424cf06 cd30a7a4 a3bc7e7f 242b13e4 e1907ae3 aa586293 e43fdaf7 aeb2361c a2e725bc 7d2f48d1 377aeabf b1126e11 9d408637 be714e84 13be1d95 cbc3b823 a826fbac bea058e9 19649ee1 36c0b616 45240c54 e332d2b2 07fdc4ae ed2c103c 1cd6a885 73a07ecf 8be8a765 790011fb f8845fcd 246f0d04 91fd80ee 34e67e84 6ba644b4 4bb83e02 c779b08f 4ddd2f4a 1773ce9f 069b7d90 e3a564df 3f96de32 1fa092ab bba41bdb cf63c0a7 6abfc5c1 5b9ff5b8 6f4ed2e5 02350b4c a54a2943 0b2ddbe7 fa1c9009 a00bb32a 24f09f79 0917b8d1 f3de9567 6951f8f9 bd121af0 ec78b1e2 a48f7a2d 809d9975 6f2249a1 06e89a58 3b5bb05c 233efb39 3219776b 69759981 f48f15db c5144be0 e8c8122d caafb2bb c55df25b 4b8c8790 347bf362 3687280e 8796cbd4 e224b53c 6de3e0a1 4678e9f2 c1c1f6eb 44ed439f 4ed5a524 fa733ff7 da1d8dda 771ab580 16608db9 f02f6d1b 578e530c 5f47c309 e0d5f717 0b31c7c4 b720578e 87eb2de7 b11150ef 00829b20 a8a981cd cf5c62d2 e33bfafc d33b3731 a64e4353 c5c57ffa 3ab88557 493f3926 9e0575fa e471a703 60df63a9 158e5145 d13324fb f2a538fb 2308b6b9 8f41f128 657685f3 a7921e78 41ffd0ee 3558596d 1469fef9 a4e24559 71e2f0a4 5de946de c2aace71 23dc03ae 41e64e09 99e9340c 3a2aca96 92ac93e9 8a5fea4b 00ec67f8 3f7b939f cdde6610 2b946258 c678f6ad 7cb32997 6fd7cbbb 16efdeef e73785ef 18837749 4bd02602 433f5592 ed16ea0d 35e18743 40f8e701 65418995 4d5430ba 2caa46fb 0f9d9f0b 40695de7 fa15257b a502a17d 7aa63e92 0b6a09cb 66f84241 9597823b 0d3bbe4a fff8ca90 5ef4f727 0c058ecb 352cd7ad 0ec495a3 11a27bdb b30c8765 a3d55cbc 353613c1 1a7eb22e d4147c43 50e88eb2 8e613993 ad52ec3c cefdebc2 270ca77c e6ad7bde c0d6895a 1b8b3879 076e9ac3 85c134e1 f4c1a5a7 4e31a6e9 4c9e2775 3b9bc7e7 f5317a6d cf005342 3cf5955a 79bc553e 6fbd44da 65400cc0 32232633 ccf07996 18feb77a d53d8d67 293053e2 a090aaa7 0672e573 982e641d 3f060712 4fd05195 aada9f09 d00ad4c0 3293a150 74fe2618 c3f16013 cd2f2b82 f1a1a929 8660706c 6220e83a e742a64a a632d490 e0039ada 2bffc8b7 99e720b1 c237dc43 7ed1e3e3 5e2f446b 5dbf8025 76f2bf60 fc17f5b4 5ee9ba5a 90c2ea74 3e173597 7912468f a5203a39 7fbf046c 10643220 bc658ff2 780f6879 c8e2a7c2 86d8bccf 95972a67 31106fd8 a18f1415 2c567a84 ae41a054 46bab288 0a5351de 231d35fd 5ebeb191 b3df2c6d e4cabfe5 c485c174 a101dea7 ea6bd875 8a6cd484 f9be7c3b 839e9ab7 3a46da37 9323c88d db5a6ed2 7db02980 aea3f796 c0658199 d9502a6b d2a09cc9 6e739262 cb86196a 2524ce03 5ca839cd 7729f4d0 4fc647bf ba015f74 b080b1a4 32b6e73d 52f914ed b001125a b784cdcf bc1703f0 0903f136 be9a0f5f b24d7c85 1df5dc13 dd89e54c 19704032 7e1117c8 8af535c0 a0e63fb9 0e877de2 96f155d6 2ca18b61 c4b082a5 d58fb0f2 bd69446a ebcb3dab 58f22b22 71b2442d 4e2fee61 7acb7f3d f2b139f1 6595b4c1 090f9a75 0f9cffb3 dd0a5ac6 3ffa8f93 076cb1c8 ae1a0ff5 f7e2fea0 560ef3fa bfd0cd85 38a93440 c92e441d 07929642 1dc18590 6253f8ed b4b02566 95e7522c 1c807645 151226aa b3d65ca2 61db5184 85b8926c 6dcb10bd e5767a65 404733f5 1fbe275b ea41b596 e3bd2089 6f0ce0ff f2c754b6 ff18f391 7df6f101 0ef32f30 6fe98f0d 22ae96d7 0150815f 02ba8631 6599b18a d9418fe0 9c448744 8bda7759 3df30d46 7edbd043 7cd8a2e8 821724dd 6b531187 31fe73b5 610f063d 9392d8d6 06d211b5 e1fbe182 fab97395 be0ec966 3d447984 09f3dfea 1f790a34 f9059976 75afbbea 51a86221 c8a8012e 445b0440 51d63565 12e47616 8e41a426 107b6553 99a9f2f4 6ae81fcd 0127d9f5 983692ea 41964dbe 0b798888 a5d17ece acd86991 2ea06c0b bbf55159 2dbc6d55 2d54f0b6 5181dc3e 5fb42730 1739ce00 6c129072 6fa0b800 d575f8b8 942e8ed4 3889c7ef 83383530 42db033a 57c78c17 ab1eb084 da214591 23534477 a83e34c8 8cced041 47ad6c8f 7c8166ac edfe1d53 47e33f1a 0103b3ba 4d6f25d1 df212243 f45ef9bd 3c9fe7ac de6b6903 e28a77b8 3a5d00fc d5c1680a 6f30ef34 90ae7ee1 02b4a7d2 14b4d805 e0030a29 1386f742 464ab9c3 bf302d3a 5fb3a26d f6580ce5 8a88a6da 1f47ef50 66da7476 246d69b0 98d4f939 589b6e18 43ccdabd 6dd3fd40 6a86ab84 4986202a 5e37b55d abe3d027 ce0a808d 3a6ea89b cd2c3d2f e0b3942c 8abeda34 afc87bb1 d64dbcf5 87c37ebd 36b4a1d0 6392cec1 6de63230 276e8c99 99320f5a 01fed7cb 805f0508 aced4998 cd811e07 1ebacb71 f36cb4d9 f340abef ca9ecd4e 75e523b9 8a72d654 be19cd9d 31412e67 26edc8c0 138237fe d26bbe27 7d877b2b 5cee649c ba1ce958 b2dce8f7 738f41ed acef704b 53a94324 bd12e536 07914722 da71de4d 28fd1439 84ae4b1e 91d3cb9b 968ab936 3b4a5d29 58f59eec f380ffa0 e4606dd2 8c1441de 300cd43c dd2834ab 4c0334de 7018c902 5c4234a8 a098da76 11660a91 6ad716e4 29ba345e b9b03461 a5e38f63 1ef7efe4 6098d662 095fdabc 9485b257 ff1c50ac 8da2d757 6da92d13 57d650a6 e4057a85 46747549 6d072742 058567ca 01454173 5c9db330 dac8ebbf bf437d1a 3b739416 8f5b0d4a 0ed6c757 a025c6be aa1d08bc e3ee7019 5b8770d6 3a63a84a 8dc6f33e 474713a8 f0a0a497 34e7ce9a 5c4d36f6 1ee1a44d 19783524 d44aebf8 35c04d5c 5f94a54a 40abf7a1 6da5dc2d 1d1b1629 85b1a05a ff514d48 36eb77e3 a46a6056 8f14ee05 8e3f2b2f 088a50dd 642aa83a 3a9cc906 338c5a7d 4fd86a4a 46673a00 cc44e4a3 60f5e1be de42918d 9e5d3604 cc268b94 48a7bf44 7dcb8767 0fee0c8f 19511aa3 53320438 0ec922e0 3068ec07 83ee3dd0 8d88c86b c1bad05a 35d7a016 d0d2015f f6804cf0 ad805ee0 efec6354 f28b5e5a 165cdbf0 f73b1241 c20cbbc6 ad0f10c9 db575a0f 967e76ad 8ced5453 e8d224c1 3c2098ea 81677de8 ce2d9f6b ce6acd8d f8d4a0c2 b1bb5b49 71fe182c 6505327d 1e5b26af 58cb9a83 1e6f358f caeb3731 53418435 0b45c556 8a8ad878 1b8e7d0e dded6e38 7695b05b 72ead96f 82c591b9 fa396656 90b8aa63 9421b424 f28b8a9b e21f95ce 2c2f05b2 c6dae4da b67eb6fa d063bbe5 5718ae18 a28238b6 71e9ef38 9e0a191a 38a7384e 2e462d66 61c79491 4834792d 2529bac0 36d0b39f 1841a53f 7c70a2fd ac5b6e69 18f9ab67 49241531 fe57218e b662f712 65e77ea1 384e8dec 17848998 5d719cb1 02f21f77 f78aeaad 2bfae4e1 98379661 33a0f682 2070c4fa 8fa4239c aeef863a bc2a4164 c22002f7 1708c4f9 5cd3915b feacd85c 5ab42f5f 02d54ff7 cfd92a39 7ae2a7f9 542dd1fa 0295230c 57e7377d 4d5d25f3 2ee53e09 0dda885b 2df8b29e 5ed9550a 0899a2e6 f7eadeb5 0ab3cef0 8ee92027 738d0b89 aae0807f 683ad195 fe114384 b8d62a9b f7ab091c 33b14486 4afd0ff3 5f125bf7 00b467e3 82a9fc84 56319fe8 9396ca68 9fa313aa 3ccb7c97 1e15d0f3 33ded202 4b0ba675 fd83dc18 25cfc645 1592d12e 297d4535 9738d12e ec93c5a8 2fb9395b 26832fc8 57a77fde 33bc552d 31700c92 ebc261af 99f215ad 3c3949cd fd12adf9 5b9b47ce 75981085 3724129d e1c1fe2f a37aa1ae ada622ac 5f032b9f 1e7adcfe 9a6add4b 74e69564 481c45ca f022e656 2af35d73 c60b509e 0ad7bf58 f7f71bf5 646b8645 c1a17f50 3d79e283 f360cd69 1001bcb1 d1f1b37c 6368e2de b7e7a5db 261a67fe 330aec25 8c20c924 ff8df569 9bb982f8 68723c6b 0beb8f7b abe06eb5 2d4e8672 aef56fc5 0daee016 2bbd5a86 a58e77e4 2dbcbe89 94f2b531 08ceb027 5a010c06 08436692 7e25bdfd 7b925b57 ffca49ef 7fe766a1 ffb60337 0dcdd9cc a6ff5547 8f6a7799 50c667ec 9a2002fe 19d99a8f d0561efd bc0e4d36 ea46d952 d171831e f22361b6 aa54a985 2a6d4275 9d5f8ec6 8b46ea03 16b7d8fb cdc73f1b 85358ede 2fee81d5 6bc7becb 0e12e8d5 94845a75 af1dbca8 3d56d6b4 85550006 dcfd7787 ddfdcd77 08249cf7 ca740659 cea13d18 cc57944a 0cd9eaf7 6dfbaad7 58bbfed1 f14415cf cdd947b0 79b63bfa 58ea1d59 ef3a6bf9 9a165409 58e565b0 a63208be ab5b1a67 2d0606a8 81317ab1 f845acae e53c890d 7f40cc6a fc1cb353 3b2576d7 499d5756 91a81409 7df55e10 e15bf15f 6cda3fc7 929767c7 bb6b5507 183c6672 bbf05122 ff21c2fd 92b34554 35b53d42 9fd9762d 953d9951 8c0b3a17 b25c0a80 a46f12cb b76b6205 ccd63c13 fa79955e 162af04d 8db3559c 9d87e598 70729644 187d4117 4a582c46 5c467dcf 10bfdec9 212f31c9 3a04c534 5d5b23dd ac92d43c 19455f66 1b5d4f76 e19718d8 d3ff9c30 7d54f133 0bd3db74 7c4fbd93 187ac236 fa9862de acbebfcf ebd587a0 484e6b94 5f7571f3 681414a6 c6525014 bdf5b87c 930077f2 30cc7395 939467df 6a1d4bb1 5dc0a6d1 488c70af c49eade1 bbe7eb64 facc9f2b 2daf3280 bf403318 85a69ed0 7c72f8f7 c9011c9e f714697d 40926bf9 6721cc95 396a2c50 8497f8a4 c064cb5c 9b9ce337 36a7fd42 c4d18fde 30a2471b 69101fc4 a5c83b26 4e526784 4b234f90 dd8bd4f5 f3f5f840 2873a731 c9058e56 aafc2f76 28925cda a73760a6 06bc6320 ace1bfbb 07a581f9 038f3b32 50a176a0 6c389513 8d9f9507 de5c32b3 d7cddca5 fdb3904b b097d642 74cd9b6c 69ac41a8 08356216 1b50f584 2c09882e 9bcecc93 73e5786f 0797e25a 0f7b025a 44edd294 68e97640 19b90a84 b7add624 297712b0 656b86e7 11a434cd 0fa9ffe4 f03e2b78 b11c24fa 8f54139c d5b72d9f 3b56c7e6 b737a354 44462b42 9322d51a 97315353 86a51b7c 0f68a106 40e3c17c e7d9e8e9 da3dfcf9 d2b3e75a 779b30f9 aa4b9d1a 2a15d00b fafcb6a3 368eb123 67e5a4da 0c51a1b6 c8fc5afb bb8f5b3f 8e26403c 8c24eaae e0305c98 75674b7c 78f11e78 324e5507 5c7a4f87 c0bc341f 85836adc 6272e7e7 b184fe83 c8a62c58 08bc711b 130da9b4 24cb4f52 73bf8b1f d86fe49d eb049ab7 74ecbf1e 4ea8c9af a1fe9d9b 73e84d59 f5bfa32c 2ecda4f6 36c19e6f cb3cea99 af26c52d b0928ff6 f6a73257 6a6cea38 b80ac150 0065d079 22bee25b 31b0df55 cc64b4e8 260147f0 c6e651b9 73786cc9 522f9896 58b63d3f 65a4867b 8561c6c1 42196a61 6fbd9120 7c958df8 f399e2e2 09073006 313e39ce 23b786fb 3e2970a0 271da0ae cd2acaa9 5487484e 59f063b6 930564ac b0384ebd e71ac35e 023d30b8 551c965e cf11764e 22e79b1f 65c23685 c9a67497 048ad63e d712a9bc 47b409db 3634f7da abc0301d b7ff5832 729c4f4d b69ed423 04328d7a d8e42c19 af125ece 5a65ae22 377dd176 ae878a22 577757db 10f59360 bc161840 8cab886c 41fe2d46 34377942 ad8ea33d c16c1279 d5ab9ac2 911a3138 0974b3b4 2f9c325a d8cf34d9 8e839b84 8382a093 753a0e0a 46d6fd81 54a52e61 ada97555 c0859e79 5ffce54f 15a29357 d7cc03a9 882f15fb e230662d 2f2beeba 4b1806c7 fdfa7ac4 146ef1cf ced78c62 31579aa4 551d0076 5226b7bc c4924239 1d5fcc74 dc6fc68f 9cc4dbc9 981a94b6 ece8069a 6e592261 a25377aa d29e6dd2 a2d84e16 9bcc4628 7a6273ac 0028a73f 0dfca727 ba932113 a78b6fea c8a307f6 0a7b0a11 087debf9 56d28536 c38843c0 0e1029c1 6f15935d cf60d4c9 13a2852d ef6d53cf 4aa17bb0 b0309df0 0a1d7c9a 55b507bf 4c166e3c 0db4bb10 ca4fdcf8 da2510d1 160685ac b120440f e90e723a bce936fa 6b3bae00 db6c89a4 557c4cba be56bb27 c8718b22 8aaa0fd4 280c25af a11ca73b 930d9bb8 a134ce61 9f2f8b73 e9b6fbc9 02dcdeeb ee4fc8aa 63c634b7 d642bc5f 733d75c0 eb28eb2f 4ab92bec ea123f20 d01585d4 87d346ac a2f7b91a 0e747293 faf02b99 b2f1a2fa 875da297 45e33a18 1c08d1f4 5cfab011 b384cba9 c6434c8b 9e1b5139 9badb36e e0b4a1c1 a85ecdc1 9cb46bc8 570c78e3 aa1b14e2 3bdb6779 16340e55 bbf05082 eb80174e 8c8bce12 7d22d0a8 9be23c41 54ae4373 5bf052b7 2cf87722 7883b621 2f0c9435 2182bfb7 59dc3d04 55c57a71 6ff3811f 7580efbe 233a0afe ffaedc7f dca3b9f8 dbd99893 4aff48de 2c12b25c db9c8289 862da073 5a4d655c 6ae3dec1 3f8ab556 5be1c116 40dc858a 5549520f fd641ac1 67841c39 42c1668b 1c975cc0 5d11c535 a2cbfabb 38b44bb0 fd4693d4 fe0d8b81 31955a8b 327f3c41 cd8aaa54 2b2f61d1 7e23b8af d4181c79 c940182b 58a6eba5 5a43558a a2a0ed48 c36ba3a0 05e70042 8b96e09c ce88de88 f9131367 cc3c62b0 d20241b0 d22b68f3 34b4fa6f e38508a9 522eed07 d185b638 3caf9d6b 72d19d1e da2d7178 13ecde3e 23771436 a6a716d5 b56a67f2 c30bc022 34d34492 cb4f30da ed189775 54d72958 04229975 86858e74 a2cecc77 c846eea3 9ebc20a3 d92a8132 844fbf1c 39b4905e 7ed2e02a 085e5fc7 e593bd18 a3f3a684 33eb7621 a768a55f 2921a9b1 000800fa 4298e197 efabb44d a5524773 688bddbd 0ca00770 6bc14d5e 79370ed3 fd9788f3 b10c5d67 26296927 a7db42c8 02fb4510 62fb5833 216c1e29 1a967962 2c8ea506 e07e5afa 74e6b33c 7f0f8c2d dc70180f fe1ea68c b7ffffdb 3ebc47b6 e3dfe1d0 04fa9f50 e940b247 fdb16d5f 9fd73bd7 a996bfda 46c3b034 dc019e30 4329e4b9 f7ae352c 9776b3ba dc7bc05e 550202f3 ad12d41e d3758b3f 0f83f188 afd88cb3 9bff9399 77b42a87 7e18b56f 2c7674bb dc395b57 29bece94 952cd83d af9dedf5 94a3ae07 05cfa365 72cbeaf3 590d1270 90972b02 0ef5b3c9 b718002a ef880f15 32660d05 f8fb6b19 fa3b6e95 38048d5e 61ed0712 31727d6d 7b3f9550 193525ef 081ccd93 05ef2d64 b93dc68b 62abaa61 59661b8b febed9a1 feaad2a5 e899f11f 2753d4ad 9fde9cab e91f3fa2 ae9a1f28 c90389fb 9f38bd22 a1455c07 61713a34 77b0fe2d 76b1a068 0e70729c 454eeed1 1fbc3ee8 324d2185 bcc67778 8304d1b3 52ccb3c2 0fa74f35 8d5943dd 846bd516 a855c517 5c915431 6a5a173e fdef41cc 2c2009c3 7654fb04 bc9587e3 ab2bac11 2bbcadf4 1466a041 a2d5a5c9 b920ce90 74f01bb4 366cc4ff 8577f948 5f0970ec 0ccf62ac a26380ac 63cd7a15 f9237f90 10094487 65e8812b 5cdabd28 62b534f3 dc2d2b96 a0643a0f 5982c4eb 8c241f20 e3e8abb5 83052388 2e957953 2ecf2065 7fefd933 48dd843d ff636f37 79cce41a f7d4ac1c aeb391be d293ae06 a4d4d1d6 524400f7 27dcb255 330fb4e9 06789ae6 d93f7735 615d7964 a6878dc4 dc785121 4a79f3e5 44adeab1 67227a02 9ec4e5db 7c4b29d7 2fa5544f 3e868581 2997f127 4410044c e1c92f72 b5b796f6 2247374e d4111ed0 7cf3dfc6 2e6c14f7 b7c054ac 0c186e77 ed2ddf6f 30955c58 d7b660d0 980cc16e bb72dca9 5815aa41 4d3ea848 c6527bd0 40a04ad5 0d6202b2 e5a07ed6 cd0eaeab 59c4e29e 63fed8d8 6aeea277 266c349d 3e20edf3 31b18724 56a08d6a 96a43f5e 2b9727da e202355d 681eb7f1 7c701639 607deb03 197ace9b ffd888f5 056146e9 3aca9147 4d526421 150228d7 7a79e415 1d37b2e5 335886ea c64c8d49 22dd455c 80f10bf0 16454df0 7c166fc1 4d80aae4 5357a3a1 d706f315 11521b79 adb814ba 014db0f1 4d3b32cc 3ccd9e52 e6557b66 1c0744c2 14fd13ed 2a259390 28c0b474 f13f3260 dee64f2d ed8950fc 7ab82299 88257f0b f20dd304 155a1afc 6e4e2338 56d670f9 bd0244dd cfa154fd df0d8f44 66fd072e 02d837de 0905598f 64c9c57b 6e636572 5448d728 69d8399e 42b3ac82 ac3dabd3 9c0a6880 cd2ae6aa 967e8de3 3404ffa9 cb80d9f6 fa3ffca0 d9e02f85 92003815 7dc831f7 ca23efca 19540c4a 10ba2755 c7c599d0 463b5f9f d68f99c1 cf969eaa e5a9adba 737eaf55 66ba5a2e c38704a6 68a243ca 8e81dbca 0b3ddaae 5f36ea33 07ec2c96 1a2660c8 3ad0c7ad 1cf6707c 8f08ee74 fd60849b 87a525e5 344ac045 4c476d94 8e39aee1 8f483365 426c1838 d81dabb9 89ff7980 3e15f040 14dbfeb3 56f91d83 72e2e71a ab55bd48 55eea94e d57d0758 235b0024 dc68afe9 63ac0cee 45bdb20c bf2f0f48 982e707b 22b0bee2 72432861 6e59f1a2 3f5992ce 9d44bfe1 dac1e9eb b8cafaa7 b3165b62 2b42a0c7 c96ecada 78c05985 8710a9ce 0b9fc599 3b198ddb 22b591e6 03bc8c60 adbbddf6 80a0f8bb 4f83fa65 5ab28551 e776f60d 8d04da8f 848d5a9d a02f9511 ab8ff59d 33b2d985 6d3a2be6 1fdb03c1 847f3245 79cc26d0 b895b642 e8514bfe 52e46a2e 8ec65d4d 8e02a265 3437a6a9 5c932ffb 0ac82b51 3415cc3b d1c9c3ce 637aeb88 5422d47b 8954d2f9 9831e6c4 7732e8f7 6f2ed72c c7a4f2b2 eda0f4f3 c2546def 4894a3ed 154614a2 84d08636 9fe8324d c15cfb39 62ae1f7a dd63dc48 3d71d1cc 9fcc6805 09f0d88e 0bbc9e51 3f8a8002 ad56ecdf af4d5830 9ea33fa8 0aab7d19 1f02a9c6 aa516ec1 cabceafb b8e44311 70f03d4d 59bccbf6 0a9e86b1 1879d6d2 f29d10eb 1aba2a94 10b667cd a3cc0411 617fd74d 3baaae79 93c833c3 b07248bf 5e63d5dc 35ba2ef9 b71310bc eac6a5d6 3220abdc d6103bdf b529c13e 8cb86c87 ae246830 bbc246b7 5ca376a9 f352026c 35602f56 e4945d05 ce7e73d9 a305cf93 d2671dbd f4e4e108 13f83603 7ee8c29f d975c48d f2f33b31 626c2627 94327b61 63f415dc 55f78aa0 82d2d9fd 52dbc2b7 55045b06 72fec845 a1951035 67fc5bc8 80a596a1 15226dea 8ef40d78 705b4aaa 0f6ebae3 40dad549 81544ca4 e3d89d6f becd9e65 16712805 b15fad6d d1c342df 3e877079 4810787a 002558d6 21fdfdca c8988c0b 3d7531ee 879f11fd 40fe6551 794488c0 27cf1bb7 5322c5fd 49f8bf7d e0be66f6 9849ca36 f8cdf740 7871df0e b5cf6cce c42a8eea 1daef00d ebadbbb3 f30e5fd9 e5664158 9bcd933e a6a600f4 5a7dfe79 a0d443cf 29b17aae 0ad20f01 d2148540 d75bd129 596296ad 0a9a08f1 5e470022 88d08a38 80774bdf bec5d2e9 5b6799ce b3b3f45a 29657214 3448e535 bf597bb6 36c9e013 63b90dc0 227a399c 69981632 91fb1be4 d7599a3c 8814ebd7 839734e0 55882dbd 7d9aaf42 89f4a02f b4503d36 cb381d37 e6361634 466f3f4c 68474e3a 67c58798 4b3466f2 74b6ad2f 26f47991 2f90f99d 34f8696d 36c1e367 89f43759 d30f429b f14ebabb 473c5d22 4b6cfac8 20e63a5b facb0796 53218912 6fdd34c9 1f570f8a 979fbf33 3c58af23 9a7d0bf6 b522e041 b2196d1f e2272a3a fb2a3d61 9a908e93 611c613d f3e0d654 7067e7c5 430098f2 2ad77b2b aa5d0de5 091ef74c 02a3f433 6c5940e8 71e96d66 0589498e 6537cf4d f829e41e f1788c8e 145ccfde 0c7c7e79 793358aa 3833ad2e c5310495 2d390beb 3e81f940 34f3571f e53ed7f9 6dbc4bb8 41537205 dd152347 0d5ea422 dc71fc12 5e0a4f19 95717357 ac9b7d0f 82cbf197 222b032e cf7c1e73 0a359f3a 80def638 84c47383 e44106d2 c45b66b2 5cc9cfff 1101481e 848a8ba8 9fd79006 11ae8e8a 7e77b631 cfe5733b b80b3c7d 4eaf0806 55d46a67 05e652d6 9f0f1bc6 7f24003b b62f5711 42a8fc97 eeb6ceeb 39938523 b67eb01c bc1d3fed 09f58fab 8e98de6c 12b49be5 7358dd10 f4fd95fc 64999d04 84b53426 21299af1 ed70dd36 ede16bba 0eeb7c1a 20dad5bf 351e10c9 c87924b9 1d0d92a3 d37c8f16 bb082d87 8378b96c 92bf1cab 6fea29d9 f0b2a04b 86016e0e e7221a21 8c5e18eb 23a038aa 98139661 13ac0e9a c84232df d75c9f6d 4a7363d4 e8ae5c8a 67ba495c c13c451a c07e4eaf edec29ab cc3084b7 078ef4db 7cb263ae f35f4b17 ad371a70 277a18e7 4390bca6 f8c60951 336f06dd a64a1d26 64e8ba76 7edc5c7f ecf8322e feb59b39 034cf2dd b0c6331f 8442793b 46d11529 b19d5b2d 4f4c656c 499d059f 9187663d 2b1ae738 cc6546bf 01d62638 127b8999 483212d4 1fc7506a 9e8a7000 30b82658 0b2da697 d9185651 dc945d3b cd90025d 3d9f9c8e 146f9c92 2d67fd36 028d19db 4df56084 5b45263f bdfe659b 1982abc7 1f03f194 2991c479 c9d3d60d 35d68d2f cfbf6371 f304e45b e2a8e2fb 5a7e63f4 e6bd1234 4e3c44aa b002bf47 e183e430 c0e40769 b2353930 3d017600 0ebde478 fb01932f 85967732 75df75c2 4f5f6a36 e3522018 3d84af5f f4d6bcf2 ad352f19 e02dd08f 50aee57f a935e9ca b8f565ee 205afd96 7d2821d5 c43c5141 8fc5f31c 16d5eb58 c70b2859 ec15c0e9 affe5590 f5782ce0 074b91cf 6c2904a1 98e2779d 358b6269 6779a775 1dcca5c9 0ea2c86f 8feea70e 37fc88ec e12e63cb 9e525329 b44791d6 ce570342 7fddaba5 5e3e7378 d51f68b1 7e3b455b df36a93a 6f6539ef f7943db6 291d923b 9280e0ea 7e971bb2 9cf540c3 86a8fd6d 6e3e58f4 43c3e191 338b2d8b 47b9e47d 22e53e71 0e868c66 b68f3445 a6e7ac43 ef969b6d 251733f9 62d1ad36 ee427275 3eb1fbe7 a1a2be2d e4c78887 fd5b6405 dbc25ec2 15a3cf5e 133af82a c6fa00ef ad5b80fa bb053c8b ef5555a9 a143c5b0 a92cc019 f611f67a ef10032c 7e081b50 005bf1b5 0e4f8699 540ca6ae 4d8418e7 ece8fe1c b93ee8f6 26f7c3d3 6bf8f666 c4b6fc45 3b5f0994 bf838a4a f385943d aa9e3d70 09285183 d740a6a2 d341c2fe 6f637e10 e27f4d87 00be44d2 4c7b331a eb329ffb c8848998 5c16e075 94433336 72672a8e d1e2f6ce 7f8f87da c5c17ce8 6d4af14b c2fc9ea3 359bd659 8728d0bb 6d2de7e3 aa92b93f c16bcdc1 59e4f057 6adb31a2 d05a22de da406f94 02f15f21 a375f169 51fdadd9 a0f4e101 eb2fc20a 6b8140d9 e8904655 9b8038dc 31f56dd5 f49e7ee8 4c6a398e 234fad4e 35ab799d c1526dd3 ec9b5660 b3dff061 a738607c da7db046 17346f89 20d40191 16722969 39c2026c 0259be11 c91124e0 52191ccc 4173cc64 85892dfe 0a5c2eec 242b79e7 369598be 7cbc3999 20fbc0b7 c3cfbbd6 04ae88f1 9d6de6a1 ef2665d9 c559f994 15e8d73e f8fd0169 fc12d0b0 216a9982 70740c64 2aa90604 c142e773 51a335cf 4e4e6e83 1f53c594 8db6793e 8f238d76 ca5b1546 f4f4dff3 f98d3826 b00e28ba 063536ad 4e65de2b b30ba40e 473499c7 f3418a64 b1d99dea 039e1f66 ee2b0e2d 6f42d8a3 58312d0b b05f35c1 8d9d787b ae87fc62 58502855 51675da4 ad477cdb e20d450e d2b0865b 61e7c815 34574c30 5bc39778 79abe955 5ba8c129 97a4db00 3a8709ee 69ed3461 53aefd4e 1ecde776 ba9eb243 eda8ee1b c07943ac 12eab525 a3e4883a f541efe0 5e6071cd 0927699a 2c642456 6b590f72 a5b4fe3d 5790d336 12b9ecfb cfe753df 0632ede7 ed69220c f71e9d4d e9e883a3 24746e9c f3ee56a8 17b8686e 1f9f9d67 78e79288 a8ff51f5 bdbbad21 87c77d85 622fb38f da80bfa2 ae3290d9 b4f62884 ed6a5c7b c10a3b5e 3481702e 3f3034ab f2a47ae5 ee41954a d9d9b191 4d797a15 72552452 eabd03db b0b0fdba d433f3ad cd3295f6 04bb6978 0363125e 5fd0beb6 ba0115da 9c8e5eda 52276264 5f79f14c 4aae6b2a ccdb8760 76eaed4a 6c2a5449 8e9fdf93 aa273e57 7ebe93bc 17953771 dc8efe78 df1d654f e5653947 dcf63325 52e98aac d8326a6d ff626c50 ad68a945 18451216 976cf849 eed6998b 11662652 1358e1cd b1960129 9b3e9361 78687fe8 ddf95249 e779b774 e9d5b057 0e00aceb 99de64a3 98b7140c 4c92c102 bb2136d4 c7779c7b 9e13022c 32bb902c f9556ee3 22e7bd46 31b9a136 2823672f d374ce46 f80a40c1 f8ca9c60 031bb2ae 7e5b8771 941a5027 e498c5e3 aa8e7d2f f9fdb0d0 15e66c17 59d64522 8c3fa41b e400a4d9 26a9877b ee294e04 dbef52a5 8f09ff41 34db655e 73bb987c 8be3b5b6 1feee9e2 81f0854d 30cd4cc0 e8d892c9 ba473ecc 601aba89 d9cc6c4d c13a303d 17a7086e 5b435635 cf3d963c 177ceae1 663510d2 d8b410a3 19087ec3 69484dda 2c20b9b2 41fe5856 60ecd880 dfcf1799 7a1732b2 b4667ecb f55f2c0a 8c822809 00b68f3e 93ebcc6b dc5e52cd b9a70159 a64478c3 f5154b10 9d426162 28b18d95 44f0cbe0 a93afd95 f1292f65 0662396a a686f3e5 05820508 314c44c7 40fcd5bd 92168c24 dd7e7d88 8789f5a6 61054d68 f75ed0ca b731aa24 2646ccec b2e1667f 37d371ff 138c2148 52d702e5 90ea8caf ba4ee512 c2fde2a4 1076c1bb 6f32dce1 939f6b50 b36f2bde 83507600 56da9a17 f4d4968d 1bed0c96 76bdf974 7e3cc2d5 1a06b7da 36387542 80c775ce e7e6b45f 22605db9 423c07ce 1b42737f 98653340 d5c454c7 20e858af 8639ad5f 5a5d472b 9e5b73a5 44c9f306 c16f8ebc d07d6767 34fba1b7 16181c23 e6fef2a6 6f430b16 607c0fad b0dd050e ea113ba3 a84e54e3 e7feae08 fb19a653 7b0ae964 d73aacb4 5a46c7b8 c8028f96 36f0b8ca 10010320 b36c110c 603e036b f63d8cf1 0337b5b9 d0dd3be2 2067a8dd 1022de3a facb1711 74defa08 a20303af 1f044540 25ffdcab 57f771e2 1a82a8f0 d2649d7d 3bda9c64 6b511384 f36f10f3 dee76735 9faab096 d96c20db 7a537678 402fa7db 05d69e56 eb7408fc 4abca503 dddfcb60 031ee12b ac7d4223 3c664783 51ff0d6b 8c38993c d5fe0927 26e659e2 41535506 82c98cd3 baf69d53 2cf1eb03 a1a0dc83 ece6a9ea cd7b39aa 6acee8f0 29130f23 74246b8e 7844cac1 30b162c4 80076e74 311f87fb 3fd6e240 02beb5c5 5e606516 bec9ab81 604945b3 ce9566eb 29c883bb 70a7d923 beb38830 18275d57 10b17177 586c7754 ea27639b 933b10f8 8671c306 c4d11c90 089488fc c74d6bec 29888453 fca28747 7ebdceda 72501890 ed662a52 7e34a53b 2d9d4da6 8d83c1c4 d199d614 5936163d 698b2f08 b6a33874 b0938c7f 99d77875 d70cd1f2 fcecc329 fa2040a1 23b0c61c dbb366d3 4abfe530 3dd37f3d 043ee45c 3aeb1e27 2e2aea7d 5d0d299c fcbb0537 c21e87ec 77f95390 c59e44b2 179e43dd 64aacf86 40d8bb15 9b152e9b e055842d 115207c6 ce63d05e 6c7f3847 d7ca0314 61e92aa9 3d5dab9e 6f848a46 8209fe84 3c03635f 6528f93f f0bdf692 887ce9aa 5db87e27 1d404609 e4668219 ac697b27 33f3c2ea 2cbf5989 5f2bd8ef 484b215f 17ba5de2 6dc75aba 00048998 57e1a55f 9a6dc9eb 4bf70336 2472d3c8 b2c3ab2e 4099d01e d5c5239d b4ddbbbe 0d681c46 78c3d408 4bcc2905 8dd744e4 4356e3fe 6f82c681 69317ce6 2b79217a e876c5a9 6078191f 0c09706c f5112b3b bd873b85 b2b7cdf2 0bf879b4 14cc6491 c0f636fd 76307b2f 9105bbd7 a27f7629 bf737ea5 76778403 31007288 a3c8b371 cc35790d 4b6d67d8 8fb0d2b8 45126d99 17f4058d 1af01c6d f58d6914 0708ffce 7960d60e 22703123 b5a9c276 2343c3a2 d1e7b6d5 6c1574a6 4ee3c68a 76fc6489 2497b348 ecbad78f 5e0010e1 99a4d8e3 2a276641 c6af9c2e 27a174d3 726c2bb9 851a056c a50ef578 91f96b23 4278567c 6497aefc eeff3735 24abebfc f27045e7 2df7d071 f050783f 21a4fd38 ee82d8ca a26602f3 99ef2662 ec11fdf6 8d413c36 ddd01fbe 3360134b ed52f1ac 090d904e 9b4dc319 bd9932ba 331b259e 1aca1ecc 1cefba4a 0a690b99 129ad33e 3519a819 031104cd 2e5f98a7 2f03c0a0 8b3dfbb3 6c5a5720 d1986643 2cae4532 55894a85 8076f1d1 63c5818b 341cb0c3 b101ef88 11620e0d 86df6261 121d0fa3 d95d2098 9a374a95 10166731 0e981459 f3755294 5a0c5042 c0372da0 36faf34c 4ef13284 ef2b87a5 65f592b3 74f987a1 44f6ba6f 03ce0e09 d24f1e12 ae9c9e00 b7ef8030 0210383c 990feb67 0e53476e 05cb6761 451e362a b2e448f2 c456152d fa51869a 091063fe 9013181c 86f8a4e6 0b78bdfa 251c132f ecf6e7a1 7c659c53 fb944bc6 d20a7f53 053946f8 3c243264 d97f6c07 02f947e5 27c865b5 e18cb82e 8e951ed3 a3e3065f 3d26e6f5 b5f3dbdc 251b83f2 07c5d4da 16ad0a3b 3a60f314 c69864f9 837fb636 b7fe1763 7087f85d 48b6f0d9 91b7d6ab 2e9e3ae6 66a4d483 ee2331a7 1e82f69d 5691ac28 7235add1 fff42d6b c3dc8266 70deddc3 27c2e5ed 14fc7b2b fcffd578 3a582ce8 ea73c540 2c89ca46 2b0bcc0b 3d7123ba e36f5798 eb7fd8e5 02d87fcb a589603e a5b1e595 6e766788 a285b5a9 ac2aa1fa 04e46408 5fa519b8 3b0e1137 1296aaa2 137f5e40 80014ad7 7a5ec0c2 58e1d089 cf6cfe64 50b3d3a1 ac4243ba 287b3188 f4f2e46f 5586ab2c ef667371 e77641e6 1a5879c3 e66ddfb1 fb99d736 ba479c53 d8e36bd8 c9a8a6d2 c620adfd 11a55510 3c551197 1fbd9ec5 ec118243 cbb8efb6 f14dab19 18686b8f e32d19bb 12694628 4b906e33 378c07d9 34cd57f7 f9605093 68960567 9ff3715e 5b79f884 047c7983 801dc839 b28aea90 76963e23 3408cbbb c54b80fe 5fc7e21f 509beb04 0909e45e 80cf12b2 470eb293 5eec33da fa42666e 64861fd8 7a40e077 29ab59dc ed62dcfa 8042eca1 427a57bf ca5722a4 d07a7fcb 82f44d82 d17767bd fac6d0ec 63ca263f 473ee2a3 40843048 949a9d47 8006cfc9 2fc520e1 4b316566 61eb59f8 a4e98667 1a798f76 8e29ed66 b8c9ebad 856cd39a a16c2f14 a08c0698 a98add36 79246468 c72538f8 bf1c5537 e9937cd2 4616a16b 2ea9c2d3 b2c3c2a9 a0314223 6d1c7b97 f26fcae0 88b23822 31041c67 03d0e984 df912bbb 57e1de78 e4fb4a88 19b671c2 c2e67f10 f9dad6d2 7056f64a 6addfa81 021e5acd 5e802ccb 3b0ef44f ee953f48 fc0ded53 bbb3b03e 4ac05911 16f14629 ce133dc1 f03c8214 428b1908 92b08698 a59739cc 5dfeedc0 713e1230 68777fe2 53cdc657 5df35528 16af1cf2 95bdea8d 5ad00b72 30dbe2dc 9e5a39c0 17e9b3c2 a2cd4444 d0b25ac1 fe20478a d49f68df 0975ec61 bcaf4976 c4a1d528 3d6db1ea 68f29999 68e225be 024b80e4 e213c7bc 918b5b55 b0c26eec bcea09c2 38a8cd2d 5f6c9d42 4ec1dc1c 6fdc1cea 1b46c87c aaab4829 463d485a 25a5000e 935f7d23 bd309963 83911035 b13c5984 a0ac1bbe b487847d 273b1637 455fe6ef 0f71c168 4ff27291 82643fbd 78c83ce4 bd451d36 18b0cbc3 44a7841d 04a34563 e321c9ba c8b35a1d 0611d64d e5576511 60b29baf 4ea04c37 ff87ce04 4197a608 fac869aa c5eb57c8 27e019da 18733cd3 f50a924e b93da798 722da6d3 72b7765d 1f02b187 46081ad4 ef2aaaee 28fbdddf e4817f0e ef5f5835 f305fb52 716ed79e 79be2b65 1ff76360 ce77e5aa e6e453f1 275a6f54 e13ca6d1 e73139c9 ff71ed7b 9d1fa404 c944deeb fd6e88ea 36cc6907 ca87f385 1e8461d2 1a89296b 06382824 8fe00926 202dd5c7 2cf2b803 3d9dbba2 b5e68c24 74e0b699 acce735e ca7b1f5b d9245ae0 3ac657ff 9febef40 8cd2c78a 2339a31e ffa144e0 72b879d1 434011be adf9c88c db2c4790 72beec41 defd9b27 68695d51 15e0d36c c3140023 0d189bfb 1e3325c0 8df63a9b 312d0260 04431281 ee1b3985 8babe0e9 cbb988a1 f89630df dae657bb 45d361fa 09d49252 69995f67 c69c5b6e 6705f065 988e6d26 3ecd791e e031d6dc 538ccebd d788e3f5 c7055c75 74485d7b 3b2a31f0 0261a804 3b89f677 47034fe7 dfc6a464 e8bab60d 4123e940 37f74e59 f540b2df 4c94898b c6040b1f 45e12308 92e96e97 b655c43e 0d1f303a b7e84fa7 d85e70f8 bb2ed146 4ff5f0ee 9326b270 5e6a2876 08dc3ae4 b7e0056f 2c080707 f948fe86 c714a899 f0cf1fd7 36afe58d d77ba3db ef3a29f2 b0132799 a4642d5c cbc1bbf0 d88b8c76 6e121f62 cdfcb74a 08da7fbc 92ef1a00 38401cd1 edc2ab92 7a065da7 2d71caaa 4d2906f3 d36cdfdf 92a19c34 0ec30d7e cb4473e9 afe2a414 cc056be3 64a55e2e 53a4a531 f3380db5 c8818b99 1f07df0f 14d03350 819d219d fa83fd92 10826d0e 7b250caa 0e87f66e 1d00a7c8 8d2ab73a 869a0258 f5c3e44a a36995d1 76c8b3f2 8cdf954e c8dffe1c fc6060af 95e47def 5e3da29d ec595290 29a90e52 85a491c0 4e6a2519 76d4a67d 1e40717d ab69cdf2 ba8b5aa6 4d5a2bcd 2bdedbad ff114239 113d2068 cc69c1db e5803140 0ae33c79 6a2cdf85 ef871d45 8ded847d b7819ef3 0be1f445 ceca3bdc f2d03aad 2805a34b fb094886 3583591f 73a03ae5 0331fc25 045e310e 1267a3fe 1eb3d421 6975e689 7fa6aaf0 e9a4b969 9fe4b904 546705c0 53a98e28 b5c2dd18 b1361bb0 060ed5a2 217bb490 68c6dbda bcee15e0 415910a5 01ccb335 a73e1813 46ed61ad 9f5c02d0 39546c7b 9d75b9bb ac9413be 0c050c7a eb6428fc ec39b105 856bf047 a2537794 a84edb1f a3463c88 aa7b55cc 1ba37216 f029bcde 2d4d4c12 3c07ddc5 7c826943 87f59fc1 ad478569 707e4e78 c7cd20bf 0b51b99e 8f489743 40ff28de 87613229 b905ac20 78207861 5937cfdd f6e53e60 75495901 f20b1b69 18e89b3b 3f29df7f 7a7d5957 693ebb37 491393ed ddc0fb24 6f562d52 1fbe9ff6 555856b1 562693b4 577e247b 66876fb3 24bd0ed3 fe6d2c55 72d02a9e 63f0bba4 03eb0a66 76704e65 7f9d6eae a80be756 eff83d78 0e51e907 7d74dc1e 917a87c1 f26b4e13 7f77cb37 d09a06c8 11f3b59e ccdf24e1 e354f8d2 d1544adb 3fe5218b be0030e3 97617ac2 b2311267 99b04e67 519e4722 26561817 c7ff0564 7b3b7836 e07fe757 0bb6fcdd aaea806b fb7cda46 18a60f8b 4357bd02 0c2d9d5e 05b09257 74e10c06 f9e8ea68 298524c0 29ab893b 7cf14388 96a5b455 f822a820 c66a85d2 dbba5383 e4c5d808 3a14d57c e4b574f0 4be58fe2 26144133 296a2169 a6ef70f8 d013ad15 7acfd097 f08a5c5a c93899f2 16a3875b bcec8b78 963259d1 e270a91b 9b6d4ad6 58e28616 4d5cb3df f272fccf fd7cbd02 731fb8e2 d8797cd9 b8562e68 5da2286e e8f93e0c cc9f3121 e652ffad 09249ece 8079c672 9059b506 41a01119 7eb90ee7 0309e120 c9a6e679 9e278a6c e011bfb2 ba9e4ccd bbc837b5 0c74acc8 1abc0065 11ca6fde 44cdee43 436f264a 57e05f2d 59f01114 4a4404ac f8ea6aee 689cfdc1 18b64edb 384c8d85 bf0918b1 58ea36ca fb9fcbc5 bcdae75c afda5f9b 1ee1e633 3aef34dd b76cf0ab ffffbe74 ef10329f b243e329 91509ee6 520f1dfa e4fddf9f bb7370f1 173bbc1f 82fce9be 65ce5780 9f5e39b5 e7488d97 a123146d 40340462 7ca415c6 78567f93 f5c53977 6153e529 75e6358e 7d185b7e 5da592d0 44e813d6 f209a7ea d565c77a 4a47c592 4c60328b 2fd2797d 8035253c 2b9cb1c4 61f3659c ba4027b8 836ed36a f5918a04 5656cdae 3d509200 4e317612 1fdfbf32 577adc04 b0f42d73 dd95a606 0cfb3488 d9c52454 1d694182 be7a4f5a 16707552 99bc0110 8e30ced4 53c83f14 e1edad8e 89062109 5b550f11 f054057f fa25b668 da5a72dd 118fa859 c7340b5a 1a9b4dba f07d9fc0 8c3071bd 173b7cf7 6fd11893 917895f9 b75ce43e b98677ba 12a462a5 d56a6dde 8e969941 ade70721 8904451c e38da676 e3f13f57 02704596 f9935cd3 02659e91 65926b0e f6423d55 0e3e3d86 bffb5979 91e0d743 140766dd 20b22991 60d14e38 52c8791b 1cb6f75d 9adb8ce0 7e8dfa88 82417a84 286edc39 5d076024 0711763c 5c68392f f2da0464 51d94915 1ca5cfe2 3b838827 8342b265 1da94e30 8b749f48 f4cc859c d61fd2b9 15a1caad b4cdb4be 104ce54f 8490601d 5d4799b9 7b0da9a4 3c1b6658 f5437d0f abea49c1 7a6983ff 869148cb 7a66b34a 3eabb8c2 d9ef80f5 8371f078 4ee8f800 e6dcbbdd 8609cb65 6d882265 c587d392 1c0c0ec9 24dfa2ca 519351dc 8742b2c9 3817dae7 8676c80e edf176a9 8e284109 9b69bd38 38ebc921 b61a0901 af2cbd25 9cd5fff8 336b0ec0 54aa9ec7 5b2ee4c1 3656e1e3 2f919a43 23715283 7060dabe aeca1de9 bc7ab654 08743079 fa440f66 479c07e3 0e64009e 8bb587cc d2db81fc a3be32c1 9441964e 72608ce5 de42cb67 f39fdffc 7a573aa3 384ed45f 1701f73f 0b34e541 0bc08a19 66925c95 c20e1d5c e6594cb0 fb849d29 a1e1e6f0 cadf862d dd101c6e b5e9e72e 4e049381 1304a298 fa6f567e 73111a89 76ff284f 829b1a83 59ab572f 94397b49 7cf958f3 73af651c e973f17d 3084c303 29d6e960 fddf9483 fe826dac 755ce8a1 72d4be6e 4294084b a627682c e702aa8a abdc7094 a78304d4 f9cbcd56 ec9e568c 3106eaf6 4fb99f2a fa8d5109 f28e74dd c69f2a84 716666f9 79c82c69 4b962608 33e13978 5b7ab446 fcfd1209 ba1fbc0b f7dad681 ce823c94 a8d01024 c3da03e1 463d78df 3e111046 f097f9bf 52ce4882 0efb2c3c 185b2eda d868fbcb a138f957 f5538e02 53daf234 9fdf2826 bff325fc 4f87586e 5a9dcbc5 79571172 03815050 e58b02fe e0808094 c2d7ae64 c6fad473 01a000c3 798589c9 a3016968 8ffc9c57 18f8d0ec 4f6e36d1 1b4590c8 4c254d78 6b79b6d4 5d39e5b7 d2a57ea7 61b8f603 57952751 0ad6e0d2 5642ca72 d745786b 2cbfd195 a0980f3f 35a15953 2e55ce48 40679375 14b4056d 1b5387b8 6b1e5224 d9039b44 1fc6974c f4c45551 672dff2b 81978830 bdde6835 0376e4e0 4c972c22 32129486 4886a663 029b03b3 cb0e88ac a8ef2d1e 087161a2 33a3f5b9 fe95e84c b282cf73 544cfb82 a80ee8aa 01eff30b ffea9a81 e55272e8 22fa41ee 3febc060 82c4210b cd5776b2 ade1ca27 72b18e30 e789ff92 feed362b 3ebb2b3e 8454d5d3 8da22294 ca8986d5 2787ce2e 30806893 3c03e716 0cae2fe6 c1d68eb1 b8756c7b d2c267f3 4209eb9e 7faf8230 8b4de1d6 02b10918 7e1eacc4 7a5019ee 4e10338e 49e6d6fe db0a551a 6c3fe5ac 61da319d 92cd1ebd 5d151499 bff46097 29bcb6f2 11b7dabe 1685cb3b fe7d48ec f1faf598 d0b67f89 de44fa7f aebd7e24 bcbb1eba ddf5a5f2 2ff79d99 600e9ffe 92005b18 6fa2f1a8 92c29ec2 8d883ea6 476e4805 3667fc14 9a421339 d67c977a 7732e5fd ed793cfa 7b950aa9 931eb9e0 5160f7bc 2eb84993 b7fd29b8 4912e5eb 32baa959 415ddd2b 35c8bec6 c3a275f6 507f0c45 6b1e92e5 e18e5bf8 7d201b61 4da5e8cc c2e07241 de7529a8 2b26078c b3813b42 1364afa1 1700bb0b 0ce4ecea 522b54d0 45b8a20c f3934f04 ec0630d8 8e6b0ab8 51c44863 b51bd02f 5e304d44 48e8e777 ea015047 27512a12 e38d7a4f 15357889 ec477a5d 8751522c e74ac11d 7bdd4909 1e3e3cb1 e7e869ae 6ab4092d e9c1b9cd 83578d78 c06fd0a0 c5956773 842014f9 2118f87c 92dae057 a20f1039 3496463c c0b68b69 0c59e5d5 1fb84328 a6ebdd1a a56a43aa b7a9a2a1 2643fdbc 446e2d0e 8cafa753 d61356bc 69f52fc3 964f9fbd fdebf3a1 fce21cbf ce7f5c37 a0385ea5 cadf97a0 681ebec5 30c83924 5858291b d7d8f3d0 7c0d53f1 1bd2e34a db87caeb e5d52400 f96b0fb3 ebf4d41e 050e39c2 7e9b0d74 fb6e4bd4 0740f29d 47863cb3 414272d1 a4d614a7 a8d2eec6 c7df4d9a 64754376 446035f4 45a325da 3dd2611e 856cf065 9f067be1 4f6797c2 4fe9ba36 453441d2 6d8145af 2b4eb09f 9ea8ae42 5812ebd7 6338ce59 608d762e 08ba542b f8ba1ea7 a5ab1369 812df3ba 4038948d 5cb720ab cb5658f5 712261cc 4780094c 364eb524 e55fd91d 0576ac2d 36854f6c aca6d66c 1164bc65 4d1c947b b9790fd3 5f52ede2 b4184f01 e20642af da2d36b6 c1883e70 179cf90b bd791e0b 9cff9112 3bc26c70 45e99302 b565eb91 a2f04483 a1918e9f 32d81898 32e75560 264eab4a f2437f71 15e62bc8 15403921 673f8580 13343e3d 31b0f3cd 13610796 a23565d8 9350dfb8 58385431 ae245627 5adef1b0 58ee4241 cd2797cb b763c61f eac74177 c6b586aa 1813af4d 24af3346 587f09bc 9e6541ae a34f2d4d 6afd1ccd 6bcc1851 7508fa8c 90f501a3 53f04a78 a2349bc7 d5f5d20b 4bc009c9 a7fd32c1 504e00b5 3ef1c027 b428e926 ecd34511 73103563 1c4cd885 5f8daa9d 24e70760 cc128ac8 368051f0 a1a6614e c4210655 9201186f e01a1a53 cfca578f 17f927c9 a482cb6a cf129bd4 b4d91161 ab0938c1 15313d70 83090bde bf2f51d0 a14c0715 b9190ca9 6c79313c 78e8573d 501994ae 8b83118e 928ce17f 06a63f05 a0c85f2e 4181bbb3 9e5de40d 92531621 a86728fe 78eaeab2 c9974846 65a7994b 9cc184a5 90799ac0 6c588efc 4cc868e4 487158e5 aaffc9c6 887433e3 98631f87 6e39b48e a83b01b8 0df6a98d d0f31f02 5cb3d9b2 1bbce6a1 f8b88512 be8955b3 b56e261d 06f09813 72c7c9f1 63bb0855 3da40c28 6767b628 04b83900 184ea43f e302ffb1 ee41eced f2821e7d 1b9f907c 250ecc5f 787eccd7 f38f3ff4 f9c9b8fa 3540d5ef d250b7ee 5f8c9181 1fd772d5 b5918331 24d8d937 6fd6b4c3 add453dd 6dc5001d e6b9e9b5 fb138ccf df83407b 20064a94 aaf7c8b0 22f221c7 0f606339 a633306b 4262625c ad7b1193 596f0a2e 77548d76 c336a603 8da2359a efbba26a e73dcb99 1c4e009a 36736cb6 2ee093a6 80c20744 fdc2f539 9a4fdda4 a5d3dbb6 36231f99 0f64313f 04103bc5 83c7e755 ebbfb5c9 0806c410 5bd82ecd ab9c6de1 1f7f8efa 1414db18 eeb699a8 d61ca780 d8886740 647e8f32 6da0e05e 8e8036f2 0bdd909f 2d19ad3f dbafeeae 7f4cb29a 67bf3f66 529095a3 bd8a845c 22e8d3a9 8ab661ef b2c9ab95 0d1d533a 919b7f6b 839ba3b8 76be7c84 28f0eeeb 18f97127 e01ed8e7 9475493a cd214138 7ae360f2 8afae60b 8094896e a881596a 9b2867a9 cff10489 49c79d72 012846fc f0b09c2b 295d84eb ddd2d96c dc4f1d09 c191a334 0ea54982 2fac7454 79bec13d c24985c9 82a23174 6fbaca8b e2e847f7 83c8bf0c 73a1e5b8 2b96f6a3 c67f7a90 c10845ff 25ea132d a2c91b49 d6e3edf4 34868217 72e07158 0af910de d8a80e40 005a3419 12c2ff53 a4c7ab87 d2e2e3d1 b588b9b5 f7e29e5d b1d661c5 34a71402 82890ab9 1b62508c 3a01663e 145a49ba 6e2e922f b4349caa 497e3b35 a13c4447 f967dd3d a3543f82 9e7ab9b8 3ecbc480 39ead448 c2890463 b0784c09 ed1e03a5 4e8570ae 583073bc 3de3d2df 0f199a44 f35c2578 4c49998e a886b025 e6337a80 488195c6 fbdba6e6 d78ba8d8 3f32793f a889192c f157077e 23a655bf a2195312 f6001e29 3cafa2da 23464eb0 ef0e999c 76c3847f 070f85dc dff6712f 82c86f0a d60a58dd bd63f3c2 526c38a0 0a0a11c8 12c35da6 d43d0f60 5fbfa940 d97508a0 6d627cf4 dc0e5b4a 2bcd3934 7068b39c 649e3532 a9dad214 77d57735 24d09a23 7be0a749 fedcaab7 b73d141a 3c3c1794 497ac5c1 e1eaeb41 bd4ca5fa 7fed7c55 344dee4d cafac399 ec78572d 3c6599de 4f1ed4f5 74d808d0 41b513a6 472a6e7e a400e868 e7a08ad0 36821172 e98bb617 729aa293 97f548af 8ac05e9e 4e136c4f 7a303cc4 fef2e051 1fe985a6 a16823d4 fa77ba66 5031ec2b 5077c44b 1f04526d eae5114c e35e70e2 09755a86 c1f4dbae e3b80a51 81545acb 92070805 333ebd30 56c88469 c225fdda da0fafdd 4c0291dd ceea0b16 e45b1626 00a604e7 afaa9120 718f9aa6 81f3209b 4da76efb 8895bd6b e12972ed eef44869 c1b323ea c7adffff fe793902 e45bfa86 59f532c2 33ba36c9 97eb20f3 8dc6484a 1cf1be5c 5e5ae019 045ad101 6ca015f4 6dfb0872 f71bdfcd 01fc3885 90a3bf87 f12c4270 3f1973d3 9dc93bfa 44fd111a c7fbf1d8 d31546ec c94e7b8a 7845ae38 d9204ff4 0d62b38a 28bdb0d0 bbe22625 6ad4f71e be10a7f0 adaaa661 bc9e2389 0e2f90c5 176e11f5 5a67a980 7c92cb83 108ea2e6 62496ece 408c72f5 64d3ad85 da7f9c37 a83d7898 d8ec6292 bf54188f 3b1e985b 03942a39 73d41f0b 157a0f42 ec29791a a1dfd8b5 c05943f2 ef7b1ba7 b4ae2eaf 034b7cc0 0ffb2ec5 6ad308f0 d54649f2 f3af6b06 cc4f552b 7dd40cb8 bb679e3b 45b8d6ae befd047d 6a0672a9 6e9a181c d8689410 3c75f79e 51da6d87 85c280f0 e5fbb22e 1c79c755 a5803c1c e388c136 8586198a e8986e37 aa8b4ea0 90fcce4e dd820167 a063d3a9 b050658b 47511084 520adbef 2748547d 953b3747 bbe79062 f55907bb 66525f15 9b4b5bff 0e515716 ab640d6e 5bdc5f5f 7015c65f be372de0 f392847c 5420016d cc166b44 a036c93a 7192ee26 f7f41ecd 2a00602b d2ce6fe7 921c3734 4eb99709 118ee844 d73d700d ca8dc237 7015b9b2 98d1c7b7 064fe2ef ab2ef079 de6e5db6 3de85fda 18866512 ef4d9d97 6c3807f1 cc28a56c 2b2e1127 02d34765 bd59f996 08811c0d 7eabcdfa 842a86fa deead0c1 34b4e2e5 623efee6 659a8d18 d28c410f 3f9a163a 7612ac91 a34a4c40 fc22ba64 9f232163 7bdc5534 8e78b80a ecfb1250 d29aaa68 2f014e28 70e22c2e 8f82a671 5f2710f3 3f50d720 55b28022 6d3e29dc c74c9698 86b63522 e45aa335 15d3229a b033b9a4 494b0ca3 8adff6a1 d04e0b97 699b530c 5ea9030b f45a67a2 a2754153 512f2085 fb9bf874 5bde718a 132b1011 9748197a 03d8d2ae a7d8afe3 3aabdb98 35d36d10 8bde76e3 3ea82ba9 40fbfcd7 c02697c6 a0b7a231 87ea50df 95cc2cb7 616aef90 759472d3 2d5c1059 0e3494d2 6b8c0528 2899221a 4fa29df6 63d6da66 ca616e54 736f799c 2a6fceb8 9dbae1a7 52adaa11 98a5cde4 6ae3db5c 6b5d050b e3da5e48 6f47b070 8e0306b4 2dcb77fc 8ec68231 4daf50d5 85243154 54e6e12e 4b93bcd0 34fa10a5 7910ee85 f99473d9 1e715b0c b932e2b0 3b9b7009 b08519f8 20866a30 c3ca40ae 33766c07 8243788d ae58228f 757ed1f6 62f17d7a 013a9670 91a60910 6b70f739 a496c0a4 e33e149e bc51bef5 7250c8a9 6ae8ad04 3a343f52 e3e5a45c 4bccccc8 7a571ced 48825393 2d1266b3 03e4325d 73a08689 b213f8ea 9ffdf82f 894f8aa2 5d624d7d 23ca80f4 de4f1a45 db4d01e1 dd3edf15 00e7bb03 12861b57 549467fc 8cd05a7c 578d522e aa6bc5e2 9f9acafa 71d7dc80 c6247dec 0fd09a9e 56d11b00 00320366 7e374668 cdf814f0 e2a7af95 d0faf906 8ae48e6a 4a37b61a eb5a3604 377d6c34 c045c168 5a388a8f 0792c3c5 cff99a88 5713906e aa47c8c7 f17babd9 90906239 de5d4617 5cdbb441 b9e57ec7 972a0ffe 23260d88 ad55c71a 8f5a7122 ca4cac93 c563fc71 a8e5a115 3e883fba 1aa540f9 c9883b19 0d123e05 cfb845d2 26ef988a 11cea0a4 d0550564 34feefb9 75276bc9 dfb2549a 75c4edc5 47be4c4f 89861a3c 47efa198 c5ab35a3 141f9ad5 3e2dc6f1 9c7c0259 13b72770 3494876a 499fa2a7 087878cd 4aadbc8f 1657b31d e55b9767 ce280c09 d25f303c 4b0f894e aa1c5287 8857ed0c 1b180e7e a9731e87 e2c70d38 36724055 b450db08 dabac28c 8ccf9d29 863e3c66 318f78a4 c6d3dd4b 970f8cf9 dccd2412 00cb5da6 f10c7334 a18dd8d7 2b488bd2 a5db16b2 0d0e6eb7 c46aa1ec 42c75b64 3afb9316 6f8f269f a3869d72 32207ed1 cdb4c43e f3fdaa8a ff5e7197 55a2bc63 bfce66fa 88bd1c78 39e89c2a 9d4d104f 5e313074 b6649823 0770888d 40452dcc 0ddbfd67 cf2c3bf3 1e1d7077 7f868131 67913e37 4d34927e eedf86eb 38fcd92d f6da2d1b 4e1d26cd 7de3d48c 062a12a2 a9e9d0e8 b4051c1e e0a26c82 47d16e9b 9cc59123 f440dab5 fb26b3ef 57c0c900 16778306 d38e9500 33488678 1a8f78b3 fa397d88 0a99bef5 ea9b121f be209158 8ebec08d d0415265 805ab7ef 5c6069ae 1b49120c 9f3ae380 625bf62c c3571fa1 b7107a8d ab5519d2 1ce70663 a640e433 e78384f0 dfcb9623 84f82beb 863115ec 009f04be 8fe12f90 3ecd189e 080a6c0c 2ab17692 98287eba 1c5583df 31eca341 05d22d14 643a0fc1 9a1e8de7 0f6da3fb 4d12fe1d 812c4171 43d8b838 e2c322ea 420b3990 a6411fbc 6085257d 05fa4f43 9c1143e6 efd011aa 23740c8f dc323686 04ae7548 18a994a7 4229633a 69cb69f2 4bcd8019 32b4d0bd 287bb88d 86331fa7 7c9e5672 c5c71690 09ad7b85 0d4714bc 7ca37761 65e21a58 c44d1134 ea4df8b9 d2b7b12a 6792f37b 12bdbe29 1dae1f33 d0a43a6c 5607931b 8a984281 c44d9ef4 c31ed148 376b175f 53b4a010 499626f5 81554305 cd4edb0e d39bea5f 96704741 fd7c2253 0dc043f0 fe50e7c2 a651b52d 034d3ce3 f6794884 5d1d787a 387292f2 7528149d 496d1b1a 15540066 dce894a9 ebe9e7c5 3dbd81f6 b8cfc09a c8490b75 13dfbf2d 9a29ad98 e4d6ef0d e078dc2a 2eb5ce64 cab98c6d c5c3ca9a ba3f3dad bf2c0695 5b8bc61f 39a40ca9 57b01c02 f05a9302 2fa63aaa a895e8b3 45bceb44 3d1942d6 22309d1a 75f656a1 de16984e 205779e5 3a716965 2e521d0c 4baf3f0d 0d7d3eee bada9c4d f656ba26 9f9339ee 62401cc7 2b37516c 3248bb6c a4a72305 904b91f0 73563f36 40cf466e d6d10185 2a819cdd 69e29761 bac48248 8354a5f3 5e55df7a bc5f18ec bed1b280 f55aea8e d1b3fd15 22074ccf 531deff2 375bd682 27ddb547 9de53be8 a3a74ef7 d0567647 b75e3d08 69ba73e5 3ebf293f df621eaf 4e45fc14 7a9a3c3b f35e4a4e 97020715 750ef0c7 6cafbc65 ed64f935 3f7c980c 8a596cd7 bb807b5a f21bacdf 46d27445 65e8e128 a397f089 daaa9c49 0c20253e 1efb3e36 3abcc059 d19b8cc1 218bb0b1 6f9bcf4f 5203b801 3f901c7a aacf8914 2bcbe375 2c868fa1 daf7c204 e30b2d6b d2835802 08390420 1dbd9f31 db74cca7 efa68efa f654020f 2e5f99bc 87ae0c8d a40067f9 45af87ec 32029106 6a7376f6 44ac4103 87019c17 8efcffe4 99de351c cca7749d 513873f2 abff6f8a e03c7d9e 49e30f0a f944f8db 97fe19de 52283cd0 270888a5 31d533ec 746d498a 423d68f7 ebe55be8 cc490151 f06d6ea9 d56889c2 66d20912 e63fe8da 34f64b0f 9cf0acf7 aaae8f7d 7ef07d0e 2c3736aa 9bc2e514 d36649b1 8a97d272 3ad38111 77dd7ddb 54bae5d6 6c021735 c051c086 4491637d a06e4f25 45ca3a6b ab219cdd be4e371a d688a1ba e29739e7 4c89e92d ab3159f2 60ae8a68 cd13152b 8487ed79 70b2ecea 1c13173a 0004683b 63e51f29 9f68ad9e 20c76a51 8eb6029b 5e4e3396 712e1932 17545cdc 2f9434bc 4c2f7502 d383a7d8 36eacb45 afb780ef 51552a3e 1c379327 b4d09d1d 1b03edba dd8407fd 0796c7ac e2fcc60b d36bf965 157ed6f3 4eaff931 281b8ac0 09e75466 03c13985 1e7c0ef6 1c2c1112 3f7036dc d58adb79 a4f4b5a9 47226a9b 5dab39e6 dffd8258 1f6c6568 1468a049 9d1ce888 1a1bad1b d4787f98 3fe44e41 05991131 3bd694f0 8e4837ba 03dfd5be cc2dd4bf 603819d2 c84c6eb4 83ef3c2c 75bc7243 cfd3fbe8 5cac2e2e 3c69676f b326317b f4636603 649f5a5a 1e5523c5 e27e88df ef42c084 d0945275 3a405210 fafd6cf5 48941205 3d6e7cf4 e7020545 874bafb1 83820dd7 0161f7ee 16e5b821 e36a9d0e 651be89c b4aca131 6547a1de debc7027 5f945cc2 cea075f8 77de762a 4e4ecaed cd18a32b 86da2552 faf1c4b3 977a8c7b e5a78955 27550851 2e7c36b9 25b031c2 4a357a97 42855e0b 299226a8 70259485 8ad453e0 843f7fe4 2323a43f 94da727e 3b8018d4 f41dd5b3 f46b3f00 bbe8eb91 0f171c9b 28ad29e7 ff5373c3 6ed55425 1a37fe2c 3ae4bcc2 21f16030 fa447ad7 b53b73dc 8c34656b e48285b7 6e46c76a e0dd7805 160087bf 2e2905b6 30dcb54a 11650659 33561081 c497de92 387f94e4 9e241b3c 69e1aa06 55a674a6 23d4f093 af2b5c04 a526d9e4 8925e7b9 a851b16a 9f1bda20 d335d525 f5283dc2 318d8602 0eab4e6d d708c984 35c03e99 8624e0df be3ecb66 8a06c966 1d244f5a fbe36e6c 33e3f6f5 e4aeaf71 29c498c0 53f4b7c3 74a99c8c d68e93ad e375b553 2a926820 398b519b 987063a2 3ed00300 f850a683 aa015452 8cdc2fd0 5604119b 14339cb6 700a22ee 527b759e b7b18353 854986e1 d4b2c15e 250b4508 e25e51ac 5f2a9ed6 d796ea82 8a28536f 03202f5b e6ee0cff d5b3c383 b14196ce d6f6e4cf 1e2b05a7 a6bab818 ddd8f81a b929ae8d b3aa8d45 876465b0 31916e77 e32fa111 90ca81f4 fb171f15 d39a1c94 93031450 3d7de5de 35551196 8c11f45c c508f518 e0b12f72 ce804a97 f9bfc5da 51d67c62 16e7838b a07bdb47 80862417 0dec2f6a 24f25d5f eedcbb89 dfbff304 38bc785d 584ca3fe 104ed9e2 6a1bc972 9214b532 55262be0 881b0430 b19c1602 c3b8649e ec6f8d53 69acdd5c 615f3924 96ae945b 6a2271eb fcd5c32b 44f8cc48 9c78b1ae 46fbf450 e523e0e1 49dacf14 bd916777 74dfe173 a4dc7d8e 5b3cfd49 4af8f994 9de9dca9 9df207cf 49899204 fcc5f84f 9c673a4c 4ee9f0c9 73f1019d ae5bcfa6 f9fe563e a268a706 cedca61e 1dde525f 8b8370c9 9156b481 08b185cd 67814847 490a722a f2b9d68b e5afe8a3 84f5d805 05d42498 15957557 fbf71413 562be4cb 7e0f4acd 7ac8d89f 40de4db4 b8ad4f0f cf009cb6 fe49b7c2 07f9fbd4 8bfb8866 76eccc18 092a4c75 812d1668 eefdd548 d91d42d5 39a0161b d303195c 02f5304a b2623b6d 9e2975d1 d4ebdbca 3adcc525 e011512a 5d02ed86 a2e2a277 d0a0fc62 e8a61f94 493d7fdb 6be1d23e 8030fab8 74f5dc33 55add694 b7bf1803 6ceb1b20 b889f589 df9f923f 635c0636 4cac587d 8d812ae2 d847a94f ca6738a0 999c6afb ec637ec4 21198ca6 297bd5f6 b5ba5f35 b22842da f13e420d d57bb072 6db4737d 9ce890f9 b511a6a5 74f96343 5457e62f fa048487 94b478d9 53a95ac2 2fb4988f 27f16654 7f4414ed e5e2695c 99f4b429 26492305 18de06e5 534a0df3 abd26e95 7296ab63 d97954bc aeca413a e37632a0 0429b392 ea13391b bfd47f71 8dc752e4 3d57efb5 fc8c0f53 65623530 5ff0217e 37e71710 c400edac e5465e92 ac247e83 13ca7afa 70afbeb5 f2baf837 9c8cced9 da8278d6 64561f1c 5d5104e7 5a20b3bf 83c4aef4 6490a9a8 7246ef3d c1b27517 1a707290 f7e0347f 4275a59c e6756c58 51925979 53081199 16e50ec0 a9eaac04 ca60e31e 0edb58f0 5833b007 d24e660c d51da613 2f0a6577 8f77623e 946b79ff 5c8125bb 34742bff 50c20805 a4c3f5c2 761651ec dd139fc6 02222594 817593af fd681496 dea466ee 26a34109 dbf0961c 9ce3e65d 237c3d1b 3ed9f134 d16999a6 90df5de6 85b020a2 585de680 bb6bbd01 f8a64bbd 187468b2 88b25327 07fade96 5d9a3cf6 aed47aa9 67e2f4ab ee6899b6 3fc81c84 f07b35de 164ebb8f 1c1dd42f 787107cd 608f0405 1b05c134 3b302780 44c2cfe8 594fb32f c4ed2bc6 1c259a39 69b31921 192809c9 4dd5ae49 24e7a4b8 1a550d1d 161e20a8 5fed931d bb2d3d44 10d2d8b9 034785eb 09218c1c a8582de7 15b4af49 70c4a36c 50b8b283 d225d9fc dab44dde e6442092 a3ab98f7 e1fa00c0 be9484d8 1363270f 55ca38ea 431ea29b eab3b13b ec2ec5e3 fa4aa2fe 3cac4e41 b33e631c b6304da0 434da8a2 c2b6a89c 08a9278f e5b75c90 8e69d561 c8de0410 e51c9736 665f35b1 b773ed5d f12c2066 ba5871b4 734c240e a7d6174c b83afa71 bda1f965 20413870 3288beca d9ebf2c4 23674078 74cadce8 d7b5111d fea0759a bf839927 65330c71 91bf4136 dbd7fe58 48d2ce26 959ca0de 3de3b755 784d5710 200a231a 2d67986e 97a6a6dd 7a1b7fa6 2e64fc84 88576afd 456681ea 85f2062e 63870a5b 9bfc24bb c65c3d8c d1af9af1 2bb8b1b2 bd0d5f8b 01c71ad7 aa8674d7 36bb9868 f91ff015 7281c776 d891c41d b336c17a fb4553f0 ed6b448e bbcc809a 8d88613f 1f925813 544b2bb9 08d11a7c 5f584f9c 322f7dc3 b41efa3d 4eadc389 b5a3d28b a46000af 11945c55 258b80a5 ff5b4ada 712a0b70 4fd658b3 a4431cc4 9d1e383b 7786efc0 902e3a62 b29aa4ab bdd36af5 8e05ddba 44dca275 53d6a863 ec68ddd2 d51c033f 674d48bc 4cfddeed 1d33d242 5504656c 52ff9edf e5242e57 0b0ca5e3 c2c52c70 dee8a660 5879c3ad 9b569a79 6da8fe0c 0ee8c3b8 5ef249cd ed25cdb9 49f6d4d7 e330cd83 13750dd0 ad74d325 38e34efc 914b773f 76706f16 7b6e5405 e460a861 6be6f053 11a15c1a d36734d4 b6c0dfb8 7f417904 a6488a08 785f98ac e49a7673 bc0bafae b9dc60a2 6f8a5fb8 769810ea 167192aa f9f1f9fa a9bf78e2 db584fff 4c2c48fc 1782951f 29c48d02 41e68291 a9b476a9 e34a4260 d414055f 11a8a052 d613a61d 72fe4d98 43351ec5 ba48b58f 33c99a16 6d7d3d8f fb78c9ff c380f00d fbfd6e94 9c069c94 6d2f9052 7d644bb2 af24987e c10f5f9c 9d2ece70 6cc478bb 8346e7bd 30bc3e7d 6618af9a 3353087e 99f74edf b6b8a2b2 21212b9a 7c22a3b1 c1eabd63 0d87c84c 1b8bca18 6c124560 7fb01155 0f5d7d6f f40697b0 1d0517ee d866f2fa 5061e008 d42e73cb 05924f2b 5555f1e0 a266210a cb8a9b89 6b896b2a 89caec9f cefc6f1a 8571055c 88a8ab02 bded511e 87ebb5df 7f814ccb 05da4f22 f2319571 d25ba618 e57e6717 82459858 9c3d6981 046929a7 b87aeb1c ba2e567b 0b7cfaa7 e0a886e4 a0161665 61b2bf72 ba9d16bb e54d59d9 2dc47b06 7afd5ff4 87baec8b 31061dc5 4abb4323 cc389198 713bd089 da69ec49 25141029 35e8008a 0983abb8 45d59549 f69e0c64 17ff0e6b d5dc97f9 ed46507f 93100a76 f0445b13 ba5b73c0 7f4ac092 37757489 01b51bef 8737aa41 4c5a8d64 4504970d 9a5f5148 f9a99923 8386a690 42e1459a 40b57482 1f5718dd cbf35479 d0c17cec a48f86ec 95dcbcf0 1613277f 8be0549b 5e859e23 98efd832 fb5127b3 0b56a10d 0547ab25 66f335ae 206ae49f fd96b711 70a2a33d b07421b1 75764bf2 d43026ad 76a6262f 97dbd72d 91026a90 62ffa907 94950e73 2547cfc6 3bfb6eb6 1da313c7 bf7fa153 8f1aeaa7 f76484de 67a650ea c2824674 c449146b de6fe0b3 38b06c96 7d06d656 c4c9c323 f43a55a6 3fab0fa9 22b57ad3 e5884fbc c67af3a8 4a1e9e67 28fc895b ca153e41 cd642334 25f89b21 b8747879 0fc6be5a 5487022a df50ade7 4013507f a1346f52 7677e447 8740a21a 4bde4c39 9024b90d 79322858 f01f5f74 349bc383 0940df4b 63ca9acf b5cd3bf2 a3b8fe8d a9f709a4 e5da10f7 928a1dab d04cb5ce 709845ac 69999ec7 7bbc4a93 87461eb5 d09315d5 2cdcd506 83d27700 7257ec8e cbcab0ce d008d34d 35df0f43 8b2426da 7f924bec 11363585 4c3c2629 e9bd39da de9ee728 865c9f59 466e9c13 ce81e2bd f63fb481 72996fa2 94ba2b29 fe087067 126f43b9 d96776ca bab1a157 9a3ced3b 5ec59f5a 86b4d1b4 36a8df3a 76e63611 b226da92 a61b37e8 f5f21920 725573a7 9a351ad9 71adc20d c1b7d571 3f173247 4300b27c 52791944 82e8414d 0e729750 c1893d8b ba20e090 ebae1bbe 8e31c67d fa58e079 792f7135 aafc0a95 a175b660 98c5bb47 c753da5c 0d189045 4f57cfb5 825f13b3 c3e5db28 236a6db7 085b2029 4aaa2362 ec6a9d17 2f62299e 691dc01d e9179aa2 f64aaaf8 0220dd41 7084a93b 1b8f24e8 d0161517 743eef1c 0f33323f 6bbcc1d9 2c015e75 36d8695b 43e6b7f3 d1ee0c66 de3b4c3a 87f8087a 144376a3 6839619a 3be30330 18fec547 0fd63c27 4d7b7b8e f0132cea c5257d7c d6081c32 42ce2b81 c7183100 5f935160 745e007b c8aa124a a01f9ae4 ee7ca132 7efd7bb6 00e1aed0 ec86942b 6c1497bd 6cc5281d 2f9fd218 25f07924 10222c9b d7af0dcb 6447f092 f009a334 9b99a72d 2baa7fe2 10592203 37935d03 b0735f3d e20a0e54 3dd5eb1f aeab4d5e a4592f3a fa811535 8a1d6897 de55dcb5 9f3d753b 5d283a67 dd1aa81e a10669a8 6157f40b 82ce1d11 36da4c89 993604fd 6527b1ef 3cdf05ee 78d46099 5ed2e67b 07e0d771 5ea5563c 87fb947c 86ec695e 38295066 fecc9365 32b36536 89fddca0 ade8df98 2a7c4303 92fc78a6 2d0a9973 4a66ce66 0cb65a69 a002d9db 5f15f66f 15d5a6ec 11d63246 1a269b27 88f015e2 27807559 1f6479aa 6ff221e5 517f0926 180ebd66 1ed2e46f 241cd5ef 92ab3c90 976033de 58be41b3 c19b788e 360c77a5 d394762c 119d3249 c63d0586 f01e5a40 727126ce 32d41034 999099fd 131acafd 31eeaa6c ea7eaf6a 5d827614 167e8818 d51cf95d 5ff7558e d212bb19 015d0678 fe0ef7e1 d79e1abd 262b9b4e 75038761 76ac34ad 948ef27e 8764343e 3033e158 042c48ee 36462af5 2180da8f 8c7354c3 86c4de64 33ab9c18 2e933920 9cd860c3 52f46cec 252a66e9 ba231d86 e728b605 ccd3dbd5 6457ac2e 4d7e67d3 7cdc1b06 123a7b26 ef0cfb74 63566f84 c3c90987 4d4f0e8e d8ac628a ff6b6227 56c6a616 f8d79c19 4225202e 548973b0 2f9c445e 36e46ebf 2d4b53d3 7ca5eec7 22b2a63b 95196264 69a55f50 23ff1055 8b62308c d4245df3 b8108031 3bcf0320 93166df0 b4d1e933 5e69cc9d 0da47e32 80fee118 73378fcd b1cc6a58 c9121086 f8cc0a9f f07213a9 67c02fe4 f4760f70 7a1e1d5e 649d4742 a2dc4d6a 3fda893b d6a77b49 1e6b0ca9 2c6443c2 c8032187 34a62b0f a24c708b a411bbc9 d9d1a65f 0d726065 a1d85df6 a472d71e 7f0cc450 cd3afeca 99d320ae 9a456490 22ad83e3 c0d919cb ac96782c 2e433758 1f3599d4 e7da1609 8953a14b 7aabcdd9 ba86f9ed bcaaeb5a 9a937e30 4763e624 ede8569a 9dd020d2 a536e4a6 5d6ef988 76fe2589".split(" "))), 
wl = ab(function(a, b) {
  return pd.i(a, b, H(a));
}, Ge, vl), xl = M([new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 0, 1, 3, 1, 1, 3, 
3, 4, 3, 5, 3, 4, 3, 3, 1, 3, 3, 3, 3, 3, 1, 0, 1, 3, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 3, 3, 3, 1, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 
1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 3, 3, 4, 3, 5, 3, 4, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 3, 3, 5, 1, 5, 3, 3, 1, 3, 1, 1, 1, 1, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 
0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 5, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 
0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 1, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 3, 1, 3, 3, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 0, 1, 3, 4, 4, 3, 3, 3, 
3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
1, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 
3, 4, 3, 5, 3, 4, 3, 3, 1, 3, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 3, 3, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 
21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 3, 1, 1, 0, 1, 2, 1, 1, 2, 3, 4, 3, 5, 3, 4, 3, 2, 1, 3, 2, 3, 3, 
2, 1, 0, 1, 3, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 3, 2, 3, 1, 1, 1, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 2, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 2, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 
1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 3, 3, 2, 3, 3, 2, 1, 0, 0, 1, 3, 3, 
3, 3, 3, 3, 3, 3, 3, 1, 3, 2, 3, 3, 2, 3, 1, 1, 0, 1, 2, 3, 4, 3, 5, 3, 4, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 2, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 3, 3, 5, 1, 5, 3, 2, 1, 3, 1, 1, 1, 1, 3, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 2, 3, 2, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, 
W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 3, 5, 3, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 
1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 1, 1, 0, 1, 1, 1, 3, 2, 1, 1, 1, 3, 3, 2, 3, 1, 1, 2, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 3, 3, 2, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 2, 3, 1, 1, 2, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 3, 1, 3, 2, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 3, 1, 2, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 
1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 2, 3, 3, 3, 3, 1, 1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 1, 1, 2, 3, 3, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 3, 3, 3, 3, 3, 1, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 3, 4, 3, 5, 3, 4, 3, 2, 1, 3, 3, 3, 3, 
4, 3, 3, 1, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 3, 2, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 2, 3, 1, 3, 2, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 
0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 2, 2, 2, 1, 1, 0, 1, 2, 1, 1, 3, 3, 4, 3, 5, 3, 4, 3, 2, 1, 3, 3, 2, 2, 2, 1, 0, 1, 3, 1, 1, 2, 3, 3, 4, 3, 
4, 3, 3, 3, 1, 3, 3, 3, 2, 3, 1, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 2, 2, 3, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 1, 3, 2, 2, 2, 3, 3, 2, 2, 2, 3, 2, 2, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 2, 3, 3, 1, 4, 4, 4, 1, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 1, 4, 1, 3, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 2, 2, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 
2, 2, 1, 1, 0, 1, 3, 3, 4, 3, 5, 3, 4, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 2, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 2, 1, 1, 3, 3, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 2, 2, 5, 1, 5, 3, 3, 1, 2, 1, 1, 1, 1, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 
0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 5, 3, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 
1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 2, 1, 1, 0, 1, 1, 1, 3, 2, 1, 1, 1, 3, 3, 3, 3, 1, 1, 2, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 2, 3, 2, 1, 2, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 2, 2, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 2, 2, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 2, 1, 3, 3, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 2, 1, 3, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 
0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 
0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 1, 1, 2, 2, 2, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 2, 5, 2, 1, 1, 1, 2, 2, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 2, 3, 3, 3, 3, 1, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 2, 2, 1, 0, 1, 3, 3, 4, 3, 5, 3, 4, 3, 2, 1, 3, 3, 3, 3, 4, 2, 2, 1, 0, 1, 2, 3, 3, 4, 3, 4, 
3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 2, 2, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 3, 2, 1, 3, 3, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 3, 2, 1, 1, 0, 1, 3, 1, 1, 2, 2, 4, 2, 5, 2, 4, 3, 3, 1, 3, 3, 3, 2, 2, 1, 0, 1, 3, 1, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 3, 3, 3, 2, 2, 1, 1, 
1, 3, 1, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 2, 3, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 2, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 2, 2, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 2, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 2, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 
0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 3, 3, 2, 2, 1, 1, 0, 1, 2, 2, 4, 2, 5, 2, 
4, 3, 3, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 3, 3, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 1, 3, 3, 3, 3, 1, 1, 2, 2, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 2, 2, 1, 1, 1, 1, 3, 3, 5, 1, 2, 2, 2, 1, 3, 1, 1, 1, 1, 3, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 4, 2, 5, 2, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 
1, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 1, 1, 1, 3, 3, 1, 1, 1, 2, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 3, 1, 5, 2, 2, 2, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 2, 2, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 2, 1, 2, 2, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 2, 2, 1, 2, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 3, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 2, 1, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 
0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 1, 2, 5, 2, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 3, 2, 2, 2, 3, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 2, 4, 2, 5, 2, 4, 3, 3, 1, 2, 2, 2, 3, 4, 3, 3, 1, 0, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 2, 2, 4, 4, 4, 3, 3, 1, 
0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 1, 2, 4, 4, 4, 1, 3, 3, 3, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 3, 1, 0, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 3, 3, 1, 1, 2, 1, 1, 1, 1, 3, 3, 3, 1, 2, 2, 1, 1, 1, 1, 5, 3, 1, 1, 2, 2, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 0, 1, 3, 1, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 1, 0, 1, 3, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 3, 3, 3, 1, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 
1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, 
[O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 
1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 3, 3, 5, 1, 5, 3, 3, 1, 3, 1, 1, 1, 1, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 
0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 
1, 3, 1, 1, 0, 1, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 3, 1, 3, 3, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 0, 1, 3, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 
0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 
0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 3, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 
3, 4, 4, 4, 1, 3, 3, 3, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 3, 1, 1, 0, 1, 2, 1, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 2, 3, 3, 2, 1, 0, 1, 3, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 3, 2, 3, 1, 1, 1, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 2, 3, 1, 1, 
0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 2, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 
0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 3, 3, 2, 3, 3, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 2, 3, 3, 2, 3, 1, 1, 0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 
3, 3, 1, 3, 3, 3, 2, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 3, 3, 5, 1, 5, 3, 2, 1, 3, 1, 1, 1, 1, 3, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 2, 3, 2, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 
1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 1, 1, 0, 1, 1, 1, 3, 2, 1, 1, 
1, 3, 3, 2, 3, 1, 1, 2, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 3, 3, 2, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 2, 3, 1, 1, 2, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 3, 1, 3, 2, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 3, 1, 2, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 
3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 
1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 2, 3, 3, 3, 3, 1, 1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 1, 1, 2, 3, 3, 2, 3, 3, 3, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 3, 3, 2, 3, 3, 3, 3, 3, 1, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 3, 2, 1, 0, 0, 1, 1, 1, 1, 
1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 2, 3, 1, 3, 2, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 2, 2, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 2, 2, 2, 1, 1, 0, 1, 2, 1, 1, 3, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 2, 2, 2, 1, 0, 1, 3, 1, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 3, 2, 3, 1, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 2, 2, 3, 3, 3, 
3, 3, 1, 1, 1, 0, 0, 0, 1, 3, 2, 2, 2, 3, 3, 2, 2, 2, 3, 2, 2, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 2, 3, 3, 1, 4, 4, 4, 1, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 1, 4, 1, 3, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 2, 2, 3, 3, 3, 4, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 2, 2, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 2, 2, 1, 1, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 2, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 
3, 3, 3, 1, 3, 3, 2, 2, 1, 1, 3, 3, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 2, 2, 5, 1, 5, 3, 3, 1, 2, 1, 1, 1, 1, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 
3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 2, 2, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 2, 1, 1, 0, 1, 1, 1, 3, 2, 1, 1, 1, 3, 3, 3, 3, 1, 1, 2, 1, 0, 0, 0, 1, 1, 3, 
1, 5, 3, 3, 3, 2, 3, 2, 1, 2, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 2, 2, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 2, 2, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 2, 1, 3, 3, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 2, 1, 3, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 1, 1, 2, 2, 2, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 2, 5, 2, 1, 
1, 1, 2, 2, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 3, 2, 2, 3, 3, 3, 4, 3, 3, 1, 3, 3, 2, 2, 3, 3, 3, 3, 1, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 2, 2, 1, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 3, 3, 4, 2, 2, 1, 0, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 2, 2, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 
3, 1, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 3, 2, 1, 3, 3, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 
3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 2, 2, 4, 2, 2, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 3, 2, 1, 1, 0, 1, 3, 1, 1, 2, 2, 2, 2, 5, 2, 3, 3, 3, 1, 3, 3, 3, 2, 2, 1, 0, 1, 3, 1, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 3, 3, 3, 2, 2, 1, 1, 1, 3, 1, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 2, 3, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 
3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 2, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 2, 2, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 2, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 2, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 4, 2, 2, 3, 4, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 3, 3, 2, 2, 1, 1, 0, 1, 2, 2, 2, 2, 5, 2, 3, 3, 3, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 3, 3, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 1, 3, 3, 3, 3, 1, 1, 2, 2, 
1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 2, 2, 1, 1, 1, 1, 3, 3, 5, 1, 2, 2, 2, 1, 3, 1, 1, 1, 1, 3, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 2, 
2, 4, 2, 2, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 5, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 1, 1, 1, 3, 3, 1, 1, 1, 2, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 3, 1, 5, 2, 2, 2, 3, 3, 3, 1, 3, 1, 1, 
0, 0, 0, 1, 3, 3, 1, 1, 2, 2, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 2, 1, 2, 2, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 2, 2, 1, 2, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 3, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 1, 2, 5, 2, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 3, 2, 2, 2, 3, 1, 1, 2, 2, 
2, 2, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 4, 2, 2, 3, 4, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 2, 2, 2, 5, 2, 3, 3, 3, 1, 2, 2, 2, 3, 4, 3, 3, 1, 0, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 2, 2, 4, 4, 4, 3, 3, 1, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 1, 2, 4, 4, 4, 1, 3, 3, 3, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 3, 1, 0, 1, 1, 3, 3, 3, 2, 2, 2, 2, 
1, 1, 1, 3, 3, 1, 1, 2, 1, 1, 1, 1, 3, 3, 3, 1, 2, 2, 1, 1, 1, 1, 5, 3, 1, 1, 2, 2, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 
1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 3, 3, 3, 3, 1, 1, 0, 1, 3, 1, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 1, 0, 1, 3, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 3, 3, 3, 1, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 
0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 
3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 
1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 3, 3, 5, 1, 5, 3, 3, 1, 3, 1, 1, 1, 1, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 
0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 1, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 3, 
3, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 3, 1, 3, 3, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 0, 1, 3, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 
3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 3, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 3, 3, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 
3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 
1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 3, 3, 2, 3, 1, 1, 0, 1, 2, 1, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 2, 3, 3, 2, 1, 0, 1, 3, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 3, 2, 3, 1, 1, 1, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 2, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 1, 
4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 2, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 3, 3, 2, 3, 3, 2, 1, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 3, 2, 3, 3, 2, 3, 1, 1, 0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 2, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 3, 
3, 5, 1, 5, 3, 2, 1, 3, 1, 1, 1, 1, 3, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 2, 3, 2, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 
2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 1, 1, 0, 1, 1, 1, 3, 2, 1, 1, 1, 3, 3, 2, 3, 1, 1, 2, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 3, 3, 2, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 2, 3, 1, 1, 2, 1, 0, 0, 0, 1, 3, 4, 4, 
4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 3, 1, 3, 2, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 3, 1, 2, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 3, 2, 1, 1, 1, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 2, 3, 3, 3, 3, 1, 1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 1, 1, 2, 3, 3, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 
3, 3, 3, 1, 3, 3, 2, 3, 3, 3, 3, 3, 1, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 3, 2, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 2, 3, 1, 3, 2, 1, 1, 1, 1, 5, 3, 
1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 
3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 2, 1, 3, 2, 2, 2, 1, 1, 0, 1, 2, 1, 1, 3, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 2, 2, 2, 1, 0, 1, 3, 1, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 3, 2, 3, 1, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 2, 2, 3, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 1, 3, 2, 2, 2, 3, 3, 2, 2, 2, 3, 2, 2, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 2, 3, 3, 1, 4, 4, 4, 1, 2, 2, 2, 1, 1, 0, 0, 0, 
0, 0, 0, 1, 3, 3, 1, 3, 3, 1, 4, 1, 3, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 
3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 2, 2, 2, 1, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 2, 1, 3, 3, 3, 3, 2, 2, 1, 1, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 2, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 2, 1, 1, 3, 3, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 2, 2, 5, 1, 5, 3, 3, 1, 2, 1, 1, 1, 1, 
3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 
3, 3, 3, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 2, 1, 1, 0, 1, 1, 1, 3, 2, 1, 1, 1, 3, 3, 3, 3, 1, 1, 2, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 2, 3, 2, 1, 2, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 2, 2, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 2, 2, 1, 1, 3, 1, 0, 0, 
0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 2, 1, 3, 3, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 2, 1, 3, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 
1, 1, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 1, 1, 2, 2, 2, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 2, 5, 2, 1, 1, 1, 2, 2, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 2, 3, 3, 3, 3, 
1, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 2, 1, 3, 3, 3, 3, 3, 2, 2, 1, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 2, 1, 3, 3, 3, 3, 4, 2, 2, 1, 0, 1, 2, 3, 3, 4, 3, 4, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 2, 2, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 3, 2, 1, 3, 3, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 
5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 1, 1, 
1, 1, 1, 0, 1, 1, 3, 1, 1, 2, 2, 4, 2, 2, 2, 4, 3, 3, 1, 3, 3, 3, 2, 1, 1, 0, 1, 3, 1, 1, 2, 2, 2, 2, 5, 2, 3, 3, 3, 1, 3, 3, 3, 2, 2, 1, 0, 1, 3, 1, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 3, 3, 3, 2, 2, 1, 1, 1, 3, 1, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 2, 3, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 2, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 2, 2, 1, 4, 1, 
3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 2, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 2, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 
0, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 2, 2, 4, 2, 2, 2, 4, 3, 3, 1, 3, 3, 3, 3, 2, 2, 1, 1, 0, 1, 2, 2, 2, 2, 5, 2, 3, 3, 3, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 3, 3, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 1, 3, 3, 3, 3, 1, 1, 2, 2, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 2, 2, 1, 1, 1, 1, 3, 3, 5, 1, 2, 2, 2, 1, 3, 1, 1, 1, 1, 3, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 
1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 4, 2, 2, 2, 4, 3, 3, 1, 0, 0, 0, 0, 0, 
0, 1, 2, 2, 2, 2, 5, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 1, 1, 1, 3, 3, 1, 1, 1, 2, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 3, 1, 5, 2, 2, 2, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 2, 2, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 2, 1, 
2, 2, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 2, 2, 1, 2, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 3, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 1, 2, 5, 2, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 3, 2, 2, 2, 3, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 
3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 2, 2, 4, 2, 2, 2, 4, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 2, 2, 2, 5, 2, 3, 3, 3, 1, 2, 2, 2, 3, 4, 3, 3, 1, 0, 1, 2, 2, 2, 4, 2, 4, 3, 3, 3, 1, 2, 2, 4, 4, 4, 3, 3, 1, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 1, 2, 4, 4, 4, 1, 3, 3, 3, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 3, 1, 0, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 3, 3, 1, 1, 2, 1, 1, 1, 1, 3, 3, 3, 1, 2, 2, 1, 1, 1, 1, 5, 3, 1, 1, 2, 2, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 2, 2, 1, 
1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 3, 3, 3, 
3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 0, 1, 3, 1, 1, 3, 4, 4, 3, 5, 3, 4, 4, 3, 1, 3, 3, 3, 3, 3, 1, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 1, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 
0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 
1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 3, 4, 4, 3, 5, 3, 4, 4, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 3, 3, 5, 1, 5, 3, 3, 1, 3, 1, 1, 1, 1, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 4, 4, 3, 5, 3, 4, 4, 3, 1, 
0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 1, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 3, 1, 3, 3, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 
1, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 0, 1, 3, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 
3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 
3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 4, 4, 3, 5, 3, 4, 4, 3, 1, 3, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 3, 3, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 
0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 3, 1, 
1, 0, 1, 2, 1, 1, 2, 4, 4, 3, 5, 3, 4, 4, 2, 1, 3, 2, 3, 3, 2, 1, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 2, 3, 1, 1, 1, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 2, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 2, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 
1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 2, 3, 
1, 3, 3, 3, 1, 3, 2, 1, 3, 3, 2, 3, 3, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 2, 3, 3, 2, 3, 1, 1, 0, 1, 2, 4, 4, 3, 5, 3, 4, 4, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 2, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 3, 3, 5, 1, 5, 3, 2, 1, 3, 1, 1, 1, 1, 3, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 2, 3, 2, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 
1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 4, 4, 3, 5, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 
3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 1, 1, 0, 1, 1, 1, 3, 2, 1, 1, 1, 3, 3, 2, 3, 1, 1, 2, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 3, 3, 2, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 2, 3, 1, 1, 2, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 3, 1, 3, 2, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 3, 1, 2, 1, 1, 0, 0, 0, 0, 
1, 2, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 2, 3, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 2, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 2, 3, 3, 3, 3, 1, 1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 1, 1, 2, 3, 3, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 3, 3, 3, 3, 3, 1, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 
3, 3, 3, 1, 0, 1, 2, 4, 4, 3, 5, 3, 4, 4, 2, 1, 3, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 3, 2, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 2, 3, 1, 3, 2, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), 
new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 2, 2, 2, 1, 1, 0, 1, 2, 1, 1, 3, 4, 4, 3, 5, 3, 4, 
4, 2, 1, 3, 3, 2, 2, 2, 1, 0, 1, 3, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 2, 3, 1, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 2, 2, 3, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 1, 3, 2, 2, 2, 3, 3, 2, 2, 2, 3, 2, 2, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 2, 3, 3, 1, 4, 4, 4, 1, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 1, 4, 1, 3, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 
1, 5, 1, 1, 5, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 2, 2, 
2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 2, 2, 1, 1, 0, 1, 3, 4, 4, 3, 5, 3, 4, 4, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 2, 1, 3, 3, 3, 3, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 2, 1, 1, 3, 3, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 3, 3, 1, 1, 1, 1, 2, 2, 5, 1, 5, 3, 3, 1, 2, 1, 1, 1, 1, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 
3, [O, 17, W, 22, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 4, 4, 3, 5, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 
3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 2, 1, 1, 0, 1, 1, 1, 3, 2, 1, 1, 1, 3, 3, 3, 3, 1, 1, 2, 1, 0, 0, 0, 1, 1, 3, 1, 5, 3, 3, 3, 2, 3, 2, 1, 2, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 3, 3, 3, 2, 2, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 2, 2, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 2, 1, 3, 3, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 3, 2, 1, 3, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 
0, 1, 2, 2, 1, 1, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 1, 1, 2, 2, 2, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 2, 5, 2, 1, 1, 1, 2, 2, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 3, 2, 2, 3, 3, 3, 3, 3, 3, 1, 3, 3, 2, 2, 3, 3, 3, 3, 1, 1, 3, 2, 1, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 2, 2, 1, 0, 1, 3, 4, 4, 3, 5, 3, 4, 4, 2, 1, 
3, 3, 3, 3, 4, 2, 2, 1, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 4, 4, 4, 3, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 4, 4, 4, 1, 3, 2, 2, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 1, 1, 1, 1, 3, 3, 2, 1, 3, 3, 1, 1, 1, 1, 5, 3, 1, 1, 3, 3, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 5, 3, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 1, 
0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 1, 1, 1, 1, 1, 0, 1, 1, 3, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 3, 2, 1, 1, 0, 1, 3, 1, 1, 2, 4, 4, 2, 5, 2, 4, 4, 3, 1, 3, 3, 3, 2, 2, 1, 0, 1, 3, 1, 1, 2, 
2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 3, 2, 2, 1, 1, 1, 3, 1, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 2, 2, 3, 1, 1, 1, 0, 0, 0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 2, 1, 4, 4, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 2, 2, 1, 4, 1, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 2, 1, 4, 1, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 5, 1, 1, 2, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 1, 3, 3, 1, 1, 1, 1, 0, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 
3, 3, 3, 3, 2, 2, 1, 1, 0, 1, 2, 4, 4, 2, 5, 2, 4, 4, 3, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 1, 2, 2, 2, 2, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 1, 3, 3, 3, 3, 1, 1, 2, 2, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 3, 1, 2, 2, 1, 1, 1, 1, 3, 3, 5, 1, 2, 2, 2, 1, 3, 1, 1, 1, 1, 3, 2, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 1, 
0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 4, 4, 2, 5, 2, 4, 4, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 1, 
1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 0, 0, 0, 1, 5, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 1, 1, 0, 1, 1, 1, 3, 3, 1, 1, 1, 2, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 3, 1, 5, 2, 2, 2, 3, 3, 3, 1, 3, 1, 1, 0, 0, 0, 1, 3, 3, 1, 1, 2, 2, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 3, 4, 4, 4, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 1, 1, 4, 4, 4, 3, 1, 1, 1, 2, 1, 2, 2, 1, 0, 0, 0, 0, 1, 4, 4, 4, 3, 1, 3, 2, 2, 1, 2, 1, 1, 0, 0, 0, 0, 1, 2, 4, 4, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 1, 2, 2, 1, 1, 3, 3, 2, 1, 1, 1, 
0, 0, 0, 0, 0, 0, 1, 1, 5, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
2, 2, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 1, 2, 5, 2, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 3, 2, 2, 2, 3, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 2, 1, 2, 2, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 4, 4, 2, 5, 2, 4, 4, 3, 1, 2, 2, 2, 3, 4, 3, 3, 1, 0, 1, 2, 2, 
2, 2, 2, 2, 3, 3, 3, 1, 2, 2, 4, 4, 4, 3, 3, 1, 0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 1, 1, 2, 4, 4, 4, 1, 3, 3, 3, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 3, 1, 0, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 1, 3, 3, 1, 1, 2, 1, 1, 1, 1, 3, 3, 3, 1, 2, 2, 1, 1, 1, 1, 5, 3, 1, 1, 2, 2, 1, 0, 1, 5, 3, 1, 1, 1, 5, 1, 1, 0, 0, 1, 1, 1, 1, 2, 2, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 
0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 1, 3, 1, 0, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 1, 3, 3, 4, 3, 5, 3, 4, 3, 3, 1, 1, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 3, 3, 3, 
4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 
1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 
3, 3, 3, 3, 1, 3, 3, 4, 3, 5, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 1, 1, 1, 1, 3, 1, 3, 3, 5, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 5, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 
1, 3, 1, 1, 0, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 1, 0, 1, 3, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 3, 3, 1, 3, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 3, 1, 3, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 
5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 
0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 4, 3, 3, 3, 3, 1, 3, 3, 4, 3, 5, 3, 4, 3, 3, 1, 0, 1, 3, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 4, 3, 
4, 3, 3, 3, 1, 1, 3, 3, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 1, 2, 1, 0, 1, 1, 3, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 1, 2, 3, 3, 2, 3, 1, 2, 3, 4, 3, 5, 3, 4, 3, 2, 1, 1, 2, 1, 1, 1, 3, 2, 3, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 2, 3, 
3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 2, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 
3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 2, 3, 3, 2, 3, 3, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 1, 1, 3, 2, 3, 3, 2, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 4, 3, 5, 3, 4, 3, 2, 1, 
0, 1, 2, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 1, 0, 1, 1, 2, 3, 1, 1, 1, 1, 3, 1, 2, 3, 5, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 2, 3, 2, 3, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 
1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 3, 5, 3, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 2, 3, 3, 3, 3, 3, 
3, 3, 2, 3, 5, 1, 0, 1, 2, 1, 1, 3, 2, 3, 3, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1, 3, 1, 2, 3, 3, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 2, 1, 1, 3, 2, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 2, 3, 1, 3, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 2, 1, 3, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 
0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 
3, 3, 3, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 3, 2, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 2, 3, 3, 2, 1, 1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 4, 3, 3, 3, 3, 1, 2, 3, 4, 3, 5, 3, 4, 3, 2, 1, 0, 1, 3, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 2, 3, 3, 1, 4, 4, 4, 3, 1, 
1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 2, 3, 1, 3, 2, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 1, 2, 1, 0, 1, 1, 2, 2, 2, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 1, 2, 2, 2, 3, 3, 1, 2, 3, 4, 3, 5, 3, 4, 3, 3, 1, 1, 3, 1, 1, 1, 3, 2, 3, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 
0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 2, 2, 3, 2, 2, 2, 3, 3, 2, 2, 2, 3, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 1, 4, 4, 4, 1, 3, 3, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 3, 1, 4, 1, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 0, 0, 1, 2, 2, 2, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 4, 3, 5, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 3, 1, 2, 3, 1, 3, 3, 
3, 4, 3, 4, 3, 3, 2, 1, 1, 1, 3, 3, 1, 1, 2, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 0, 1, 1, 3, 3, 1, 1, 1, 1, 2, 1, 3, 3, 5, 1, 5, 2, 2, 1, 1, 0, 0, 1, 1, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 
1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 3, 5, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 2, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 5, 1, 0, 1, 2, 1, 1, 3, 
3, 3, 3, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1, 2, 1, 2, 3, 2, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 2, 2, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 3, 3, 1, 2, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 3, 1, 2, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), 
new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 2, 2, 2, 1, 1, 0, 0, 1, 2, 1, 0, 0, 
0, 1, 3, 1, 0, 1, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 5, 2, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 2, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 1, 2, 2, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 2, 4, 3, 3, 3, 3, 1, 2, 3, 4, 3, 5, 3, 4, 3, 3, 1, 0, 1, 2, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 1, 2, 2, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 
3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 3, 3, 1, 2, 3, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 1, 3, 1, 0, 1, 1, 2, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 3, 1, 0, 1, 2, 2, 3, 3, 3, 1, 3, 3, 4, 2, 5, 2, 4, 2, 2, 1, 1, 3, 1, 1, 1, 2, 2, 3, 3, 3, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 1, 1, 1, 3, 2, 2, 3, 3, 3, 2, 
2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 2, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 2, 2, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 2, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 2, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 
1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 3, 3, 3, 3, 1, 3, 3, 4, 2, 5, 2, 4, 2, 2, 1, 0, 1, 2, 2, 2, 2, 1, 3, 3, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 1, 1, 2, 2, 
1, 1, 3, 3, 3, 3, 1, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 2, 3, 1, 1, 1, 1, 3, 1, 2, 2, 2, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 
0, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 2, 5, 2, 4, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 1, 0, 1, 3, 1, 1, 3, 3, 3, 2, 1, 1, 1, 3, 3, 1, 1, 1, 1, 
1, 3, 1, 3, 3, 3, 2, 2, 2, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 3, 3, 3, 2, 2, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 2, 2, 1, 2, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 2, 1, 2, 2, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 
0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 1, 3, 2, 2, 2, 3, 3, 1, 
1, 1, 3, 5, 3, 1, 1, 1, 2, 5, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 1, 3, 3, 4, 3, 2, 2, 2, 1, 3, 3, 4, 2, 5, 2, 4, 2, 2, 1, 0, 1, 3, 3, 4, 4, 4, 2, 2, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 1, 3, 3, 3, 1, 4, 4, 4, 2, 1, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 1, 3, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 
1, 1, 1, 0, 0, 1, 1, 2, 1, 1, 3, 3, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 0, 0, 1, 2, 2, 1, 1, 3, 5, 1, 1, 1, 1, 2, 2, 1, 3, 3, 3, 1, 1, 0, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 
0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 1, 3, 1, 0, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 1, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 
1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 
3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 1, 1, 1, 1, 3, 1, 3, 3, 5, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 
0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 1, 0, 1, 3, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 5, 1, 3, 1, 
1, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 3, 3, 1, 3, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 3, 1, 3, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 
1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 4, 3, 3, 3, 3, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 1, 3, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 3, 3, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 
1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 
2, 3, 3, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 1, 2, 1, 0, 1, 1, 3, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 1, 2, 3, 3, 2, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 1, 2, 1, 1, 1, 3, 2, 3, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 2, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 
3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 2, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 1, 2, 3, 3, 2, 3, 3, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 1, 1, 3, 2, 3, 3, 2, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 0, 1, 2, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 
1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 1, 0, 1, 1, 2, 3, 1, 1, 1, 1, 3, 1, 2, 3, 5, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 2, 3, 2, 3, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 
4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 3, 5, 1, 0, 1, 2, 1, 1, 3, 2, 3, 3, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1, 3, 1, 2, 3, 3, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 2, 1, 1, 3, 2, 3, 3, 3, 
1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 2, 3, 1, 3, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 2, 1, 3, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 
2, 3, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 3, 2, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 2, 3, 3, 2, 1, 1, 3, 3, 
3, 2, 3, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 2, 3, 3, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 4, 3, 3, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 0, 1, 3, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 2, 3, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 
0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 2, 3, 1, 3, 2, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 2, 1, 0, 0, 0, 
0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 2, 2, 3, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 1, 2, 1, 0, 1, 1, 2, 2, 2, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 1, 2, 2, 2, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 1, 1, 3, 1, 1, 1, 3, 2, 3, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 2, 2, 3, 2, 2, 2, 3, 3, 2, 2, 2, 3, 1, 0, 0, 0, 0, 0, 1, 1, 2, 
2, 2, 1, 4, 4, 4, 1, 3, 3, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 3, 1, 4, 1, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 
1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 4, 3, 3, 3, 2, 2, 3, 1, 0, 0, 1, 2, 2, 2, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 1, 2, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 1, 1, 3, 3, 1, 1, 2, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 
0, 1, 1, 3, 3, 1, 1, 1, 1, 2, 1, 3, 3, 5, 1, 5, 2, 2, 1, 1, 0, 0, 1, 1, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 2, 2, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 
3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 2, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 5, 1, 0, 1, 2, 1, 1, 3, 3, 3, 3, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1, 2, 1, 2, 3, 2, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 2, 2, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 
2, 2, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 3, 3, 1, 2, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 3, 1, 2, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 1, 3, 3, 2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 2, 2, 2, 1, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 5, 2, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 
3, 2, 2, 3, 3, 1, 3, 3, 4, 3, 3, 3, 2, 2, 3, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 1, 2, 2, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 2, 4, 3, 3, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 1, 2, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 1, 2, 2, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 
1, 3, 3, 1, 2, 3, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 2, 2, 4, 2, 
2, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 1, 3, 1, 0, 1, 1, 2, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 3, 1, 0, 1, 2, 2, 3, 3, 3, 1, 3, 3, 3, 2, 5, 2, 2, 2, 2, 1, 1, 3, 1, 1, 1, 2, 2, 3, 3, 3, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 1, 1, 1, 3, 2, 2, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 2, 2, 3, 3, 3, 
1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 2, 2, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 2, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 2, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 1, 
1, 1, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 4, 3, 2, 2, 4, 2, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 3, 3, 3, 3, 1, 3, 3, 3, 2, 5, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 1, 3, 3, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 1, 1, 2, 2, 1, 1, 3, 3, 3, 3, 1, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 2, 3, 1, 1, 1, 1, 3, 1, 2, 
2, 2, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 2, 2, 4, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 0, 0, 
0, 0, 0, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 5, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 1, 0, 1, 3, 1, 1, 3, 3, 3, 2, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 1, 3, 3, 3, 2, 2, 2, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 3, 3, 3, 2, 2, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 
0, 1, 2, 2, 1, 2, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 2, 1, 2, 2, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 1, 3, 
1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 1, 3, 2, 2, 2, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 2, 5, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 4, 3, 2, 2, 
4, 2, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 1, 3, 3, 4, 3, 2, 2, 2, 1, 3, 3, 3, 2, 5, 2, 2, 2, 2, 1, 0, 1, 3, 3, 4, 4, 4, 2, 2, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 1, 3, 3, 3, 1, 4, 4, 4, 2, 1, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 1, 3, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 1, 1, 3, 3, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 0, 0, 1, 2, 2, 1, 1, 3, 5, 1, 1, 1, 1, 2, 2, 1, 3, 3, 3, 1, 1, 0, 1, 1, 
2, 2, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 
1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 1, 3, 1, 0, 1, 1, 3, 3, 3, 3, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 1, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 
1, 4, 1, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 
1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 1, 1, 1, 1, 3, 1, 3, 3, 5, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 
3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 
3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 1, 0, 1, 3, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 3, 3, 1, 3, 1, 1, 1, 3, 4, 4, 
4, 1, 1, 0, 0, 0, 1, 1, 3, 1, 3, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 
3, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 4, 3, 3, 3, 3, 1, 3, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 1, 3, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 3, 3, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 
1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 1, 
2, 1, 0, 1, 1, 3, 2, 3, 3, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 1, 3, 1, 0, 1, 2, 3, 3, 2, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 1, 2, 1, 1, 1, 3, 2, 3, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 2, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 2, 3, 1, 3, 3, 1, 0, 0, 0, 
0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 
3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 2, 3, 3, 2, 3, 3, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 1, 1, 3, 2, 3, 3, 2, 3, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 0, 1, 2, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 1, 0, 1, 1, 2, 3, 1, 1, 1, 1, 3, 1, 2, 3, 5, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 2, 3, 2, 3, 2, 3, 1, 1, 1, 1, 1, 1, 
1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 
3, 5, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 3, 5, 1, 0, 1, 2, 1, 1, 3, 2, 3, 3, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1, 3, 1, 2, 3, 3, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 2, 1, 1, 3, 2, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 2, 3, 1, 3, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 2, 1, 3, 3, 
3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 3, 2, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 2, 3, 3, 2, 1, 1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 
0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 4, 3, 3, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 2, 1, 0, 1, 3, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 3, 1, 1, 2, 3, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 2, 3, 1, 3, 2, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 
0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 1, 2, 1, 0, 1, 1, 2, 2, 2, 3, 1, 2, 3, 
4, 3, 3, 3, 4, 3, 3, 1, 1, 3, 1, 0, 1, 2, 2, 2, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 1, 1, 3, 1, 1, 1, 3, 2, 3, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 2, 2, 3, 2, 2, 2, 3, 3, 2, 2, 2, 3, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 1, 4, 4, 4, 1, 3, 3, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 3, 1, 4, 1, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 
3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 0, 0, 
1, 2, 2, 2, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3, 1, 2, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 1, 2, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 1, 1, 3, 3, 1, 1, 2, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 0, 1, 1, 3, 3, 1, 1, 1, 1, 2, 1, 3, 3, 5, 1, 5, 2, 2, 1, 1, 0, 0, 1, 1, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 
1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 3, 3, 3, 4, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 
0, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 2, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 5, 1, 0, 1, 2, 1, 1, 3, 3, 3, 3, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1, 2, 1, 2, 3, 2, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 2, 2, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 3, 3, 1, 2, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 3, 1, 2, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 
1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 1, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 2, 2, 2, 1, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 5, 2, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 2, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 1, 2, 2, 3, 3, 3, 3, 3, 1, 2, 3, 
4, 3, 3, 3, 4, 3, 3, 1, 0, 1, 2, 2, 4, 3, 3, 3, 3, 1, 2, 3, 3, 3, 5, 3, 3, 3, 3, 1, 0, 1, 2, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 4, 3, 4, 3, 3, 2, 1, 1, 2, 2, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 3, 3, 1, 2, 3, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 
1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 1, 3, 1, 0, 1, 1, 2, 3, 3, 3, 1, 3, 3, 4, 2, 2, 2, 4, 2, 2, 1, 1, 3, 1, 0, 
1, 2, 2, 3, 3, 3, 1, 3, 3, 3, 2, 5, 2, 2, 2, 2, 1, 1, 3, 1, 1, 1, 2, 2, 3, 3, 3, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 1, 1, 1, 3, 2, 2, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 2, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 2, 2, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 2, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 1, 1, 3, 2, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 
2, 2, 1, 2, 2, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3, 1, 3, 3, 4, 2, 2, 2, 4, 2, 2, 1, 0, 1, 2, 2, 2, 3, 3, 3, 3, 1, 3, 3, 3, 2, 5, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 2, 1, 3, 3, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 1, 1, 2, 2, 1, 1, 3, 3, 3, 3, 1, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 2, 3, 1, 1, 1, 1, 3, 1, 2, 2, 2, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], 
null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 4, 2, 2, 2, 4, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 5, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 0, 
0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 1, 0, 1, 3, 1, 1, 3, 3, 3, 2, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 1, 3, 3, 3, 2, 2, 2, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 3, 3, 3, 2, 2, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 2, 2, 1, 2, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 2, 1, 2, 2, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 2, 1, 0, 
0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 2, 2, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 1, 3, 2, 2, 2, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 2, 5, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 4, 2, 2, 2, 4, 2, 2, 1, 0, 1, 3, 3, 4, 
3, 2, 2, 2, 1, 3, 3, 3, 2, 5, 2, 2, 2, 2, 1, 0, 1, 3, 3, 4, 4, 4, 2, 2, 1, 3, 3, 3, 4, 2, 4, 2, 2, 2, 1, 1, 3, 3, 3, 1, 4, 4, 4, 2, 1, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 1, 3, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 1, 1, 3, 3, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 0, 0, 1, 2, 2, 1, 1, 3, 5, 1, 1, 1, 1, 2, 2, 1, 3, 3, 3, 1, 1, 0, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 
17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 1, 3, 1, 0, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 1, 3, 4, 4, 3, 5, 3, 
4, 4, 3, 1, 1, 3, 1, 1, 1, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 
1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 1, 1, 3, 3, 3, 3, 
3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 4, 4, 3, 5, 3, 4, 4, 3, 1, 0, 1, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 3, 3, 1, 1, 1, 1, 3, 1, 3, 3, 5, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, 
T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 4, 4, 3, 5, 3, 4, 4, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 
3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 5, 1, 0, 1, 3, 1, 1, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 3, 3, 1, 3, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 3, 1, 3, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 
1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 4, 3, 3, 3, 3, 1, 3, 4, 4, 3, 5, 3, 4, 
4, 3, 1, 0, 1, 3, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 1, 2, 1, 0, 1, 1, 3, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 1, 2, 3, 3, 2, 3, 1, 2, 4, 4, 3, 5, 3, 4, 4, 2, 1, 1, 2, 1, 1, 1, 3, 2, 3, 
3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 2, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 2, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 
1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 2, 3, 3, 2, 3, 3, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 1, 1, 3, 2, 3, 3, 2, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 
1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 4, 4, 3, 5, 3, 4, 4, 2, 1, 0, 1, 2, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 3, 1, 0, 1, 1, 2, 3, 1, 1, 1, 1, 3, 1, 2, 3, 5, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 2, 3, 2, 3, 2, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 
0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 3, 2, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 4, 4, 3, 5, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 
1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 3, 5, 1, 0, 1, 2, 1, 1, 3, 2, 3, 3, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1, 3, 1, 2, 3, 3, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 2, 1, 1, 3, 2, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 2, 3, 1, 3, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 2, 1, 3, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 
1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 3, 2, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 2, 3, 3, 2, 1, 1, 3, 3, 3, 2, 3, 2, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 3, 1, 3, 3, 3, 1, 3, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 4, 3, 3, 3, 3, 1, 2, 4, 4, 3, 5, 3, 4, 4, 2, 1, 0, 1, 3, 3, 4, 4, 4, 3, 3, 
1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 2, 3, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 2, 3, 1, 3, 2, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 
0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 1, 2, 1, 0, 1, 1, 2, 2, 2, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 1, 0, 1, 2, 2, 2, 3, 3, 1, 2, 4, 4, 3, 5, 3, 4, 4, 3, 1, 1, 3, 1, 1, 1, 3, 2, 3, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 
1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 1, 1, 1, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 2, 2, 3, 2, 2, 2, 3, 3, 2, 2, 2, 3, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 1, 4, 4, 4, 1, 3, 3, 2, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 3, 1, 4, 1, 3, 3, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 5, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 
0, 0])], null), new r(null, 3, [O, 20, W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 0, 0, 1, 2, 2, 2, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 2, 
4, 4, 3, 5, 3, 4, 4, 3, 1, 0, 1, 3, 3, 3, 3, 1, 2, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 1, 3, 3, 1, 1, 2, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 3, 3, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 0, 1, 1, 3, 3, 1, 1, 1, 1, 2, 1, 3, 3, 5, 1, 5, 2, 2, 1, 1, 0, 0, 1, 1, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 
0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 2, 1, 1, 1, 3, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 2, 4, 4, 3, 5, 3, 4, 4, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 
1, 2, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 3, 5, 1, 0, 1, 2, 1, 1, 3, 3, 3, 3, 1, 1, 1, 2, 3, 1, 1, 1, 1, 1, 2, 1, 2, 3, 2, 3, 3, 3, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 2, 2, 3, 3, 3, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 3, 3, 1, 2, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 3, 1, 2, 3, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 
0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 2, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 
0, 0, 1, 1, 0, 0, 1, 1, 3, 2, 2, 2, 1, 1, 0, 0, 1, 2, 1, 0, 0, 0, 1, 3, 1, 0, 1, 3, 3, 3, 2, 2, 2, 1, 1, 1, 2, 5, 2, 1, 1, 1, 3, 5, 3, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 2, 2, 3, 3, 1, 3, 3, 3, 3, 3, 3, 2, 2, 3, 1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 3, 3, 1, 2, 3, 1, 0, 1, 2, 2, 3, 3, 3, 3, 3, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 2, 2, 4, 3, 3, 3, 3, 1, 2, 4, 4, 3, 5, 3, 4, 4, 3, 1, 0, 1, 2, 3, 4, 4, 4, 3, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 2, 1, 1, 
2, 2, 3, 1, 4, 4, 4, 3, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 1, 1, 1, 1, 1, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 3, 1, 1, 3, 3, 1, 1, 1, 3, 3, 3, 2, 2, 2, 2, 1, 1, 0, 0, 1, 3, 3, 1, 1, 3, 5, 1, 1, 1, 1, 3, 3, 1, 2, 3, 3, 1, 1, 0, 1, 1, 3, 5, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null), new r(null, 3, [O, 21, W, 17, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 
3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 1, 3, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 3, 1, 1, 0, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 1, 3, 1, 0, 1, 1, 2, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 3, 1, 0, 1, 2, 2, 3, 3, 3, 1, 3, 4, 4, 2, 5, 2, 4, 4, 2, 1, 1, 3, 1, 1, 1, 2, 2, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 
1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 1, 1, 1, 3, 2, 2, 3, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 4, 4, 1, 2, 2, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 1, 4, 1, 2, 2, 1, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 1, 4, 1, 2, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 2, 1, 1, 5, 1, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, 
W, 14, T, M([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 1, 1, 1, 1, 3, 3, 1, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 1, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 1, 1, 2, 2, 3, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 1, 2, 2, 2, 3, 3, 3, 3, 1, 3, 4, 4, 2, 5, 2, 4, 4, 2, 1, 0, 1, 2, 2, 
2, 2, 1, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 2, 2, 1, 1, 3, 3, 3, 3, 1, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 1, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 0, 1, 1, 2, 3, 1, 1, 1, 1, 3, 1, 2, 2, 2, 1, 5, 3, 3, 1, 1, 0, 0, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0])], null), new r(null, 3, [O, 17, W, 22, T, M([0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 0, 0, 
0, 0, 0, 0, 0, 1, 5, 3, 1, 1, 1, 2, 5, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 3, 3, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 4, 4, 2, 5, 2, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 3, 3, 2, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 0, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 
5, 1, 0, 1, 3, 1, 1, 3, 3, 3, 2, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 3, 1, 3, 3, 3, 2, 2, 2, 5, 1, 3, 1, 1, 0, 0, 1, 3, 1, 1, 3, 3, 3, 2, 2, 1, 1, 3, 3, 1, 0, 0, 0, 1, 3, 1, 1, 3, 3, 3, 3, 3, 4, 4, 4, 3, 1, 0, 0, 0, 1, 2, 2, 1, 2, 1, 1, 1, 3, 4, 4, 4, 1, 1, 0, 0, 0, 1, 1, 2, 1, 2, 2, 3, 1, 3, 4, 4, 4, 1, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 2, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 2, 3, 3, 1, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 5, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 
0, 0, 0, 0, 0])], null), new r(null, 3, [O, 20, W, 21, T, M([0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 3, 3, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 3, 3, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 2, 2, 2, 2, 1, 
1, 0, 0, 1, 3, 1, 0, 0, 0, 1, 2, 1, 0, 1, 3, 2, 2, 2, 3, 3, 1, 1, 1, 3, 5, 3, 1, 1, 1, 2, 5, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 1, 3, 2, 2, 1, 2, 2, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 0, 1, 3, 3, 4, 3, 2, 2, 2, 1, 3, 4, 4, 2, 5, 2, 4, 4, 2, 1, 0, 1, 3, 3, 4, 4, 4, 2, 2, 1, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 3, 3, 3, 1, 4, 4, 4, 2, 1, 1, 3, 3, 2, 
2, 2, 2, 2, 1, 0, 1, 3, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 2, 1, 1, 3, 3, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 1, 1, 0, 0, 1, 2, 2, 1, 1, 3, 5, 1, 1, 1, 1, 2, 2, 1, 3, 3, 3, 1, 1, 0, 1, 1, 2, 2, 1, 1, 1, 1, 0, 0, 1, 1, 5, 1, 1, 1, 3, 5, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1])], null)]);
function yl(a) {
  a = nl(a);
  var b = pl(a.substring(4, 6)), c = pl(a.substring(6, 8)), d = pl(a.substring(8, 10));
  return sa(a, "f") ? new K(null, 3, 5, L, [100, 100, 100], null) : new K(null, 3, 5, L, [b, c, d], null);
}
function zl(a, b, c) {
  a /= 255.0;
  b /= 255.0;
  c /= 255.0;
  var d = Math.max(a, b, c), e = d - Math.min(a, b, c);
  a = 0 === e ? 0 : a === d ? (b - c) / e % 6 * 60 : b === d ? 60 * ((c - a) / e + 2) : c === d ? 60 * ((a - b) / e + 4) : null;
  return 0 > a ? a + 360 : a;
}
function Al(a) {
  if (sa(a, "0xf") || sa(a, "f")) {
    a = nl(a);
    a = pl(a.substring(2, 4));
    var b = 128 <= a;
    a = Me(a) && b || !Me(a) && !b ? -2 : -1;
  } else {
    a = yl(a), a = zl(a.h ? a.h(0) : a.call(null, 0), a.h ? a.h(1) : a.call(null, 1), a.h ? a.h(2) : a.call(null, 2));
  }
  return Math.floor(a + 3.0E-13);
}
function Bl(a) {
  return t(J.g ? J.g(-2, a) : J.call(null, -2, a)) ? ji : t(J.g ? J.g(-1, a) : J.call(null, -1, a)) ? el : t(J.g ? J.g(15, a) : J.call(null, 15, a)) ? Gj : t(J.g ? J.g(45, a) : J.call(null, 45, a)) ? Lh : t(J.g ? J.g(75, a) : J.call(null, 75, a)) ? ri : t(J.g ? J.g(105, a) : J.call(null, 105, a)) ? lj : t(J.g ? J.g(135, a) : J.call(null, 135, a)) ? Ii : t(J.g ? J.g(165, a) : J.call(null, 165, a)) ? ok : t(J.g ? J.g(195, a) : J.call(null, 195, a)) ? Ki : t(J.g ? J.g(225, a) : J.call(null, 225, a)) ? 
  ai : t(J.g ? J.g(255, a) : J.call(null, 255, a)) ? Hj : t(J.g ? J.g(285, a) : J.call(null, 285, a)) ? wk : t(J.g ? J.g(315, a) : J.call(null, 315, a)) ? pk : t(J.g ? J.g(345, a) : J.call(null, 345, a)) ? Xj : Gj;
}
function Cl(a) {
  if ("string" === typeof a) {
    switch(a) {
      case "white":
        return -2;
      case "black":
        return -1;
      case "red":
        return 0;
      case "orange":
        return 30;
      case "yellow":
        return 60;
      case "chartreuse":
        return 90;
      case "green":
        return 120;
      case "teal":
        return 150;
      case "cyan":
        return 180;
      case "sky-blue":
        return 210;
      case "blue":
        return 240;
      case "purple":
        return 270;
      case "magenta":
        return 300;
      case "fuchsia":
        return 330;
      default:
        return -1;
    }
  } else {
    switch(a instanceof z ? a.ta : null) {
      case "white":
        return -2;
      case "black":
        return -1;
      case "red":
        return 0;
      case "orange":
        return 30;
      case "yellow":
        return 60;
      case "chartreuse":
        return 90;
      case "green":
        return 120;
      case "teal":
        return 150;
      case "cyan":
        return 180;
      case "sky-blue":
        return 210;
      case "blue":
        return 240;
      case "purple":
        return 270;
      case "magenta":
        return 300;
      case "fuchsia":
        return 330;
      default:
        return -1;
    }
  }
}
function Dl(a) {
  var b = 255 * (1 - Math.abs(a % 360.0 / 60.0 % 2 - 1)) | 0;
  if (t(Vd.g ? Vd.g(60, a) : Vd.call(null, 60, a))) {
    return new K(null, 3, 5, L, [255, b, 0], null);
  }
  if (t(Vd.g ? Vd.g(120, a) : Vd.call(null, 120, a))) {
    return new K(null, 3, 5, L, [b, 255, 0], null);
  }
  if (t(Vd.g ? Vd.g(180, a) : Vd.call(null, 180, a))) {
    return new K(null, 3, 5, L, [0, 255, b], null);
  }
  if (t(Vd.g ? Vd.g(240, a) : Vd.call(null, 240, a))) {
    return new K(null, 3, 5, L, [0, b, 255], null);
  }
  if (t(Vd.g ? Vd.g(300, a) : Vd.call(null, 300, a))) {
    return new K(null, 3, 5, L, [b, 0, 255], null);
  }
  if (t(Vd.g ? Vd.g(360, a) : Vd.call(null, 360, a))) {
    return new K(null, 3, 5, L, [255, 0, b], null);
  }
  throw Error(["No matching clause: ", u.h(a)].join(""));
}
function El(a, b) {
  var c = 1 - Math.abs(2 * b - 1), d = c * (1 - Math.abs(a / 60 % 2 - 1)), e = b - c / 2;
  b = function() {
    if (t(Vd.g ? Vd.g(60, a) : Vd.call(null, 60, a))) {
      return new K(null, 3, 5, L, [c, d, 0], null);
    }
    if (t(Vd.g ? Vd.g(120, a) : Vd.call(null, 120, a))) {
      return new K(null, 3, 5, L, [d, c, 0], null);
    }
    if (t(Vd.g ? Vd.g(180, a) : Vd.call(null, 180, a))) {
      return new K(null, 3, 5, L, [0, c, d], null);
    }
    if (t(Vd.g ? Vd.g(240, a) : Vd.call(null, 240, a))) {
      return new K(null, 3, 5, L, [0, d, c], null);
    }
    if (t(Vd.g ? Vd.g(300, a) : Vd.call(null, 300, a))) {
      return new K(null, 3, 5, L, [d, 0, c], null);
    }
    if (t(Vd.g ? Vd.g(360, a) : Vd.call(null, 360, a))) {
      return new K(null, 3, 5, L, [c, 0, d], null);
    }
    throw Error(["No matching clause: ", u.h(a)].join(""));
  }();
  return kf(function(f) {
    return Math.round(255 * (f + e));
  }, b);
}
function Fl(a, b, c, d) {
  var e = zl(a, b, c), f = (e + 320) % 360, g = ((t(d) ? f : e) + 180) % 360;
  a = El(e, 0.1);
  b = El(e, 0.2);
  c = El(e, 0.45);
  e = El(e, 0.7);
  f = El(f, 0.8);
  var k = El(g, 0.45);
  g = El(g, 0.8);
  return t(d) ? new K(null, 8, 5, L, [null, a, e, f, b, c, k, g], null) : new K(null, 8, 5, L, [null, a, b, c, e, f, k, g], null);
}
function Gl(a) {
  var b = nl(a);
  a = sa(b, "f");
  var c = pl(b.substring(2, 4)), d = pl(b.substring(4, 6)), e = pl(b.substring(6, 8));
  b = pl(b.substring(8, 10));
  var f = 128 <= c;
  return a ? Me(c) && f || !Me(c) && !f ? new K(null, 8, 5, L, [null, new K(null, 3, 5, L, [85, 85, 85], null), new K(null, 3, 5, L, [211, 211, 211], null), new K(null, 3, 5, L, [255, 255, 255], null), new K(null, 3, 5, L, [170, 170, 170], null), new K(null, 3, 5, L, [255, 153, 153], null), new K(null, 3, 5, L, [17, 17, 17], null), new K(null, 3, 5, L, [34, 34, 34], null)], null) : new K(null, 8, 5, L, [null, new K(null, 3, 5, L, [85, 85, 85], null), new K(null, 3, 5, L, [34, 34, 34], null), new K(null, 
  3, 5, L, [17, 17, 17], null), new K(null, 3, 5, L, [187, 187, 187], null), new K(null, 3, 5, L, [255, 153, 153], null), new K(null, 3, 5, L, [211, 211, 211], null), new K(null, 3, 5, L, [255, 255, 255], null)], null) : Fl(d, e, b, f);
}
function Hl(a) {
  return Gl(a);
}
function Il(a) {
  var b = nl(a), c = sa(b, "f"), d = pl(b.substring(2, 4));
  a = pl(b.substring(4, 6));
  var e = pl(b.substring(6, 8));
  b = pl(b.substring(8, 10));
  var f = 128 <= d;
  if (c) {
    return Me(d) && f || !Me(d) && !f ? "555555d3d3d3ffffffaaaaaaff9999" : "555555222222111111bbbbbbff9999";
  }
  c = ql(d);
  c = E.g("00", c.substring(4, 6));
  a = Jf(Fl(a, e, b, f), 1, 6);
  a = c ? pd.i(a, 1, new K(null, 3, 5, L, [0, 0, 0], null)) : a;
  return jl(af.g(function(g) {
    var k = I(g, 0), l = I(g, 1);
    g = I(g, 2);
    return [u.h(ol(k)), u.h(ol(l)), u.h(ol(g))].join("");
  }, a));
}
function Jl(a) {
  return Il(a);
}
;function Kl(a) {
  var b = De(a), c = w.g(b, O);
  w.g(b, W);
  var d = w.g(b, Si), e = w.g(b, si);
  a = w.i(b, Mj, 0);
  var f = w.i(b, yi, 0), g = w.i(b, hk, Td), k = w.g(b, yk), l = Wd(c) + 1;
  b = sl(t(d) ? d : e);
  b = pako.inflate(b);
  var m = t(a) ? a : 0, n = t(f) ? f : 0;
  return Ff(Ze(function(q, v) {
    if (0 === v || 0 === Zd(q, l)) {
      return null;
    }
    v = (0 > v ? v + 256 : v) | 0;
    v = g.h ? g.h(v) : g.call(null, v);
    return new K(null, 3, 5, L, [t(k) ? m + (c - Zd(q, l)) : Zd(q, l) + m + -1, Yd(q, l) + n, v], null);
  }, b));
}
;function Ll(a) {
  a = nl(a);
  var b = pl(a.substring(2, 4)), c = ql(b), d = sa(a, "f"), e = E.g("1", c.substring(0, 1));
  e = d ? Me(b) && e || !Me(b) && !e : e;
  var f = Al(a);
  return tg([yh, Dh, Hh, Qh, Uh, Pi, kj, oj, Wj, sk, Pk, al, cl], [Bl(f), b, e, ["0x", u.h(a)].join(""), function() {
    var g = c.substring(2, 4);
    if (t(E.g ? E.g("00", g) : E.call(null, "00", g))) {
      return Nk;
    }
    if (t(E.g ? E.g("01", g) : E.call(null, "01", g))) {
      return Gi;
    }
    if (t(E.g ? E.g("10", g) : E.call(null, "10", g))) {
      return jk;
    }
    if (t(E.g ? E.g("11", g) : E.call(null, "11", g))) {
      return Ok;
    }
    throw Error(["No matching clause: ", g].join(""));
  }(), E.g(c.substring(1, 2), "0") ? $k : ek, e, c, function() {
    var g = c.substring(6, 8);
    if (t(E.g ? E.g("00", g) : E.call(null, "00", g))) {
      return ki;
    }
    if (t(E.g ? E.g("01", g) : E.call(null, "01", g))) {
      return Mi;
    }
    if (t(E.g ? E.g("10", g) : E.call(null, "10", g))) {
      return Zh;
    }
    if (t(E.g ? E.g("11", g) : E.call(null, "11", g))) {
      return ck;
    }
    throw Error(["No matching clause: ", g].join(""));
  }(), d, yl(a), function() {
    var g = c.substring(4, 6);
    if (t(E.g ? E.g("00", g) : E.call(null, "00", g))) {
      return zk;
    }
    if (t(E.g ? E.g("01", g) : E.call(null, "01", g))) {
      return Zj;
    }
    if (t(E.g ? E.g("10", g) : E.call(null, "10", g))) {
      return Tj;
    }
    if (t(E.g ? E.g("11", g) : E.call(null, "11", g))) {
      return wh;
    }
    throw Error(["No matching clause: ", g].join(""));
  }(), f]);
}
function Ml(a) {
  return t(J.g ? J.g(3364, a) : J.call(null, 3364, a)) ? 2017 : t(J.g ? J.g(5683, a) : J.call(null, 5683, a)) ? 2018 : t(J.g ? J.g(5754, a) : J.call(null, 5754, a)) ? 2019 : t(J.g ? J.g(5757, a) : J.call(null, 5757, a)) ? 2020 : 2021;
}
function Nl(a) {
  if (t(J.g ? J.g(99, a) : J.call(null, 99, a))) {
    return 1;
  }
  if (t(J.g ? J.g(539, a) : J.call(null, 539, a))) {
    return 2;
  }
  if (t(J.g ? J.g(1117, a) : J.call(null, 1117, a))) {
    return 3;
  }
  if (t(J.g ? J.g(1764, a) : J.call(null, 1764, a))) {
    return 4;
  }
  if (t(J.g ? J.g(2379, a) : J.call(null, 2379, a))) {
    return 5;
  }
  if (t(J.g ? J.g(2891, a) : J.call(null, 2891, a))) {
    return 6;
  }
  throw Error(["No matching clause: ", u.h(a)].join(""));
}
function Ol(a) {
  var b = Ll(a);
  var c = /^0xff/;
  if ("string" === typeof a) {
    c = c.exec(a), c = null == c ? null : 1 === c.length ? c[0] : Ff(c);
  } else {
    throw new TypeError("re-find must match against a string.");
  }
  var d = wl.h ? wl.h(a) : wl.call(null, a);
  a = t(d) ? t(c) ? new r(null, 4, [Yj, d, Ak, Ml(d), hj, sk, xh, Nl(d)], null) : new r(null, 4, [Yj, d, Ak, Ml(d), hj, Th, ik, null], null) : Ta(c) ? new r(null, 1, [hj, Ej], null) : t(Lg(/0xff[0-9a-f][0-9a-f]000ca7/, a)) ? new r(null, 1, [hj, Fh], null) : new r(null, 1, [hj, Yi], null);
  b = yg(gd([b, a]));
  b = De(b);
  c = w.g(b, Yj);
  a = w.g(b, oj);
  if (t(c)) {
    var e = Il(vl.h ? vl.h(c) : vl.call(null, c));
    var f = a.substring(1, 2), g = a.substring(2, 4), k = a.substring(4, 6), l = a.substring(6, 8);
    a = [e, rl([k, "000000"].join(""))].join("");
    c = [e, rl([k, g, "0000"].join(""))].join("");
    d = [e, rl([k, g, l, "00"].join(""))].join("");
    e = [e, rl([k, g, l, "0", f].join(""))].join("");
    f = H(null);
    g = E.g(f, 1);
    k = H(null);
    l = 1 < k;
    var m = H(null), n = 1 < m, q = H(null);
    b = pd.m(b, Mh, a, gd([Gh, g, xj, f, Ui, null, Xi, c, Ti, l, tj, k, vk, null, Mk, d, Vk, n, Dj, m, Uk, null, nk, e, pj, 1 < q, Zk, q, ci, null]));
  }
  return b;
}
var Pl = function Pl(a) {
  a = null == a ? "" : Cd(a) ? kl(" ", af.g(Pl, a)) : "string" === typeof a ? ua(a) : a instanceof z ? je(a) : ua(u.h(a));
  return ml(a) ? "" : ua(kl(" ", af.g(function(c) {
    return [c.substring(0, 1).toUpperCase(), c.substring(1)].join("");
  }, gf(ml, ll(a)))));
};
function Ql(a, b) {
  return null == b ? null : new r(null, 2, [dj, Pl(a), Fi, Pl(b)], null);
}
function Rl(a) {
  return null == a ? null : new r(null, 3, [dj, Pl(Yj), Fi, a, Ih, 25439], null);
}
function Sl(a, b) {
  return null == b ? null : new r(null, 2, [dj, [Pl(a), "?"].join(""), Fi, t(b) ? "Yes" : "No"], null);
}
function Tl(a) {
  a = De(a);
  var b = w.g(a, Ak), c = w.g(a, Vk), d = w.g(a, al), e = w.g(a, yh), f = w.g(a, Gh), g = w.g(a, Hh), k = w.g(a, Qh), l = w.g(a, Uh);
  w.g(a, Pi);
  var m = w.g(a, Ti), n = w.g(a, hj), q = w.g(a, pj), v = w.g(a, Wj), y = w.g(a, Yj);
  w.g(a, ik);
  return lf(function(x) {
    return null != x;
  }, new K(null, 11, 5, L, [Ql("MoonCat Id", k), Rl(y), Ql(hj, n), Ql(Ak, b), Ql(vh, new K(null, 3, 5, L, [t(g) ? kj : null, e, d], null)), Ql(Uh, l), Ql(Wj, v), Sl(Gh, f), Sl(Ti, m), Sl(Vk, c), Sl(pj, q)], null));
}
function Ul(a) {
  a = Ol(a);
  var b = De(a);
  var c = w.g(b, Hh);
  var d = w.g(b, al), e = w.g(b, yh), f = w.g(b, Uh), g = w.g(b, hj);
  w.g(b, Ak);
  var k = w.g(b, cl);
  b = E.g(g, Th) || E.g(g, Ej);
  e = t(t(c) ? b : c) ? [Pl(e), "/", Pl(Bl(Xd(k + 320, 360)))].join("") : e;
  c = Pl(new K(null, 7, 5, L, [E.g(d, zk) ? d : null, t(t(c) ? b : c) ? kj : null, e, f, E.g(d, zk) ? null : d, E.g(g, Th) ? null : g, "MoonCat"], null));
  return new r(null, 4, [zh, c, Ei, "000000", Jk, Tl(a), wj, a], null);
}
function Vl(a) {
  var b = De(a), c = w.g(b, yh), d = w.g(b, cl), e = w.i(b, Uh, Nk), f = w.i(b, al, zk), g = w.i(b, Wj, ki);
  a = w.i(b, Pi, $k);
  var k = w.g(b, kj);
  b = w.g(b, Hh);
  c = t(d) ? d : t(c) ? c : -1;
  c = "number" === typeof c ? c : Cl(c);
  k = null == k ? b : k;
  a = [-2 === (c | 0) ? t(function() {
    var l = new Ag(null, new r(null, 2, [Mi, null, ck, null], null), null);
    return l.h ? l.h(g) : l.call(null, g);
  }()) ? "0" : "1" : -1 === (c | 0) ? t(function() {
    var l = new Ag(null, new r(null, 2, [Mi, null, ck, null], null), null);
    return l.h ? l.h(g) : l.call(null, g);
  }()) ? "1" : "0" : t(k) ? "1" : "0", E.g(a, $k) ? "0" : "1", u.h(function() {
    switch(e instanceof z ? e.ta : null) {
      case "smiling":
        return "00";
      case "grumpy":
        return "01";
      case "pouting":
        return "10";
      case "shy":
        return "11";
      default:
        return "00";
    }
  }()), u.h(function() {
    switch(f instanceof z ? f.ta : null) {
      case "pure":
        return "00";
      case "tabby":
        return "01";
      case "spotted":
        return "10";
      case "tortie":
        return "11";
      default:
        return "00";
    }
  }()), u.h(function() {
    switch(g instanceof z ? g.ta : null) {
      case "standing":
        return "00";
      case "sleeping":
        return "01";
      case "pouncing":
        return "10";
      case "stalking":
        return "11";
      default:
        return "00";
    }
  }())].join("");
  a = ol(parseInt(a, 2));
  k = 0 > c ? "ff" : "00";
  c = 0 > c ? "000ca7" : jl(af.g(ol, Dl(c)));
  return ["0x", k, u.h(a), c].join("");
}
var Wl = Ff(Hd(-2) && Hd(360) && Hd(1) ? new Ig(null, -2, 360, 1, null, null, null) : new Jg(null, -2, 360, 1, null, null, null)), Xl = new K(null, 4, 5, L, [Nk, Gi, jk, Ok], null), Yl = new K(null, 4, 5, L, [zk, Zj, Tj, wh], null), Zl = new K(null, 4, 5, L, [ki, Mi, Zh, ck], null), $l = new K(null, 2, 5, L, [$k, ek], null), am = new K(null, 2, 5, L, [!0, !1], null);
function bm(a) {
  var b = Math.floor(Math.random() * H(a)) | 0;
  return a.h ? a.h(b) : a.call(null, b);
}
function cm(a) {
  var b = De(a);
  a = w.g(b, al);
  var c = w.g(b, yh), d = w.g(b, Uh), e = w.i(b, di, Wl), f = w.i(b, wi, Yl), g = w.g(b, Pi), k = w.i(b, Zi, $l), l = w.i(b, fj, am), m = w.g(b, kj), n = w.i(b, Ij, Xl), q = w.g(b, Wj);
  b = w.i(b, dk, Zl);
  return Vl(new r(null, 6, [yh, t(c) ? c : bm(e), Uh, t(d) ? d : bm(n), al, t(a) ? a : bm(f), Wj, t(q) ? q : bm(b), Pi, t(g) ? g : bm(k), kj, !0 === m || !1 === m ? m : bm(l)], null));
}
;var dm = new We;
function em(a, b) {
  return new Promise(function(c, d) {
    var e = new XMLHttpRequest;
    e.onload = function() {
      if (300 > e.status && 200 <= e.status) {
        var f = e.responseText;
        return c.h ? c.h(f) : c.call(null, f);
      }
      f = e.status;
      return d.h ? d.h(f) : d.call(null, f);
    };
    e.open("POST", a);
    e.setRequestHeader("Content-Type", "application/json");
    return e.send(b);
  });
}
function fm(a, b, c) {
  return new Promise(function(d) {
    return em(a, JSON.stringify({method:"eth_call", id:Ye.g(dm, Rc), jsonrpc:"2.0", params:[{to:b, data:c}, "latest"]})).then(function(e) {
      var f = oh(JSON.parse(e));
      e = w.g(f, "result");
      f = w.g(f, "error");
      e = new r(null, 4, [vj, Ta(f), Aj, 200, $i, f, Cj, e], null);
      return d.h ? d.h(e) : d.call(null, e);
    }).catch(function(e) {
      e = new r(null, 2, [vj, !1, Aj, e], null);
      return d.h ? d.h(e) : d.call(null, e);
    });
  });
}
;var gm = jl(new ef(null, 64, "0", null));
function hm(a) {
  return [ae(gm, H(a)), u.h(a)].join("");
}
function im(a) {
  return [u.h(a), ae(gm, H(a))].join("");
}
function Re(a, b) {
  a = Yd(a, 8);
  b = u.h(b);
  b = BigInt(b).toString(16);
  return [ae(gm.substring(64 - 2 * a), H(b)), u.h(b)].join("");
}
function jm(a) {
  return u.h(BigInt(["0x", u.h(a)].join("")));
}
function km(a) {
  var b = u.h(BigInt(a)), c = b.length;
  if (E.g(b, "0")) {
    return "0";
  }
  if (18 > c) {
    return il(["0.", "000000000000000000".substring(c), b].join(""), /0+$/, "");
  }
  if (E.g(c, 18)) {
    return il(["0.", b].join(""), /0+$/, "");
  }
  a = b.substring(0, c - 18);
  b = b.substring(c - 18);
  return E.g(b, "000000000000000000") ? a : [a, ".", il(b, /0+$/, "")].join("");
}
function lm(a) {
  return parseInt(a, 16);
}
function mm(a) {
  return ["0x", a.substring(24)].join("");
}
function nm(a) {
  if (t(Lg(/^0+$/, a))) {
    return null;
  }
  try {
    var b = il(a, /(00)+$/, ""), c = sl(b);
    return (new TextDecoder).decode(c);
  } catch (d) {
    return "FAILED TO PARSE UNICODE";
  }
}
function om(a, b) {
  b = (sa(a, "0x") ? 2 : 0) + 64 * b;
  return a.substring(b, 64 + b);
}
function pm(a, b, c) {
  b = (sa(a, "0x") ? 2 : 0) + 64 * b;
  return a.substring(b, 64 * c + b);
}
function qm(a) {
  return new K(null, 4, 5, L, [new K(null, 2, 5, L, [lm(a.substring(0, 2)), lm(a.substring(2, 4))], null), new K(null, 2, 5, L, [lm(a.substring(64, 66)), lm(a.substring(66, 68))], null), new K(null, 2, 5, L, [lm(a.substring(128, 130)), lm(a.substring(130, 132))], null), new K(null, 2, 5, L, [lm(a.substring(192, 194)), lm(a.substring(194, 196))], null)], null);
}
;var rm = new r(null, 2, [Jh, "0x60cd862c9c687a9de49aecdc3a99b74a4fc54ab6", Lj, '[{"constant":false,"inputs":[{"name":"catId","type":"bytes5"},{"name":"price","type":"uint256"}],"name":"makeAdoptionOffer","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"activate","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"remainingGenesisCats","outputs":[{"name":"","type":"uint16"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"remainingCats","outputs":[{"name":"","type":"uint16"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"catId","type":"bytes5"}],"name":"acceptAdoptionOffer","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"mode","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"catId","type":"bytes5"}],"name":"getCatDetails","outputs":[{"name":"id","type":"bytes5"},{"name":"owner","type":"address"},{"name":"name","type":"bytes32"},{"name":"onlyOfferTo","type":"address"},{"name":"offerPrice","type":"uint256"},{"name":"requester","type":"address"},{"name":"requestPrice","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCatOwners","outputs":[{"name":"","type":"address[]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes5"}],"name":"catOwners","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"withdraw","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"rescueOrder","outputs":[{"name":"","type":"bytes5"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"seed","type":"bytes32"}],"name":"rescueCat","outputs":[{"name":"","type":"bytes5"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"catId","type":"bytes5"}],"name":"cancelAdoptionOffer","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCatIds","outputs":[{"name":"","type":"bytes5[]"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCatNames","outputs":[{"name":"","type":"bytes32[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"catId","type":"bytes5"},{"name":"catName","type":"bytes32"}],"name":"nameCat","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"activateInTestMode","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes5"}],"name":"adoptionOffers","outputs":[{"name":"exists","type":"bool"},{"name":"catId","type":"bytes5"},{"name":"seller","type":"address"},{"name":"price","type":"uint256"},{"name":"onlyOfferTo","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes5"}],"name":"catNames","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCatRequestPrices","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"catId","type":"bytes5"}],"name":"cancelAdoptionRequest","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"disableBeforeActivation","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"addGenesisCatGroup","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"catId","type":"bytes5"},{"name":"price","type":"uint256"},{"name":"to","type":"address"}],"name":"makeAdoptionOfferToAddress","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"searchSeed","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"imageGenerationCodeMD5","outputs":[{"name":"","type":"bytes16"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes5"}],"name":"adoptionRequests","outputs":[{"name":"exists","type":"bool"},{"name":"catId","type":"bytes5"},{"name":"requester","type":"address"},{"name":"price","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"catId","type":"bytes5"}],"name":"acceptAdoptionRequest","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"getCatOfferPrices","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"catId","type":"bytes5"}],"name":"makeAdoptionRequest","outputs":[],"payable":true,"type":"function"},{"constant":true,"inputs":[],"name":"rescueIndex","outputs":[{"name":"","type":"uint16"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"pendingWithdrawals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"catId","type":"bytes5"},{"name":"to","type":"address"}],"name":"giveCat","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":true,"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"to","type":"address"},{"indexed":true,"name":"catId","type":"bytes5"}],"name":"CatRescued","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"catId","type":"bytes5"},{"indexed":false,"name":"catName","type":"bytes32"}],"name":"CatNamed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"catId","type":"bytes5"},{"indexed":false,"name":"price","type":"uint256"},{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"}],"name":"CatAdopted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"catId","type":"bytes5"},{"indexed":false,"name":"price","type":"uint256"},{"indexed":true,"name":"toAddress","type":"address"}],"name":"AdoptionOffered","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"catId","type":"bytes5"}],"name":"AdoptionOfferCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"catId","type":"bytes5"},{"indexed":false,"name":"price","type":"uint256"},{"indexed":true,"name":"from","type":"address"}],"name":"AdoptionRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"catId","type":"bytes5"}],"name":"AdoptionRequestCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"catIds","type":"bytes5[16]"}],"name":"GenesisCatsAdded","type":"event"}]'], 
null), sm = new r(null, 2, [Jh, "0x7c40c393dc0f283f318791d746d894ddd3693572", Lj, '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes5","name":"catId","type":"bytes5"},{"indexed":false,"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"Unwrapped","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes5","name":"catId","type":"bytes5"},{"indexed":false,"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"Wrapped","type":"event"},{"inputs":[],"name":"_baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"","type":"bytes5"}],"name":"_catIDToTokenID","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_moonCats","outputs":[{"internalType":"contract MoonCatsRescue","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"_tokenIDToCatID","outputs":[{"internalType":"bytes5","name":"","type":"bytes5"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_newBaseURI","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenID","type":"uint256"}],"name":"unwrap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"wrap","outputs":[],"stateMutability":"nonpayable","type":"function"}]'], 
null), tm = new r(null, 2, [Jh, "0xc3f733ca98e0dad0386979eb96fb1722a1a05e69", Lj, '[{"inputs":[{"internalType":"string","name":"baseURI","type":"string"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"MoonCatAcclimated","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"tokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"owner","type":"address"}],"name":"MoonCatDeacclimated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"uint256","name":"_toTokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"_childContract","type":"address"},{"indexed":false,"internalType":"uint256","name":"_childTokenId","type":"uint256"}],"name":"ReceivedChild","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":true,"internalType":"address","name":"_childContract","type":"address"},{"indexed":false,"internalType":"uint256","name":"_childTokenId","type":"uint256"}],"name":"TransferChild","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_rescueOrders","type":"uint256[]"},{"internalType":"uint256[]","name":"_oldTokenIds","type":"uint256[]"}],"name":"batchReWrap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_rescueOrders","type":"uint256[]"}],"name":"batchUnwrap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"_rescueOrders","type":"uint256[]"}],"name":"batchWrap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_rescueOrder","type":"uint256"}],"name":"buyAndWrap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"childContractByIndex","outputs":[{"internalType":"address","name":"childContract","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"address","name":"_childContract","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"childTokenByIndex","outputs":[{"internalType":"uint256","name":"childTokenId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"address","name":"_childContract","type":"address"},{"internalType":"uint256","name":"_childTokenId","type":"uint256"}],"name":"getChild","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_operator","type":"address"},{"internalType":"address","name":"_from","type":"address"},{"internalType":"uint256","name":"_oldTokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"onERC721Received","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_childContract","type":"address"},{"internalType":"uint256","name":"_childTokenId","type":"uint256"}],"name":"ownerOfChild","outputs":[{"internalType":"bytes32","name":"parentTokenOwner","type":"bytes32"},{"internalType":"uint256","name":"parentTokenId","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"rescueOrderLookup","outputs":[{"internalType":"contract MoonCatOrderLookup","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"rootOwnerOf","outputs":[{"internalType":"bytes32","name":"rootOwner","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_childContract","type":"address"},{"internalType":"uint256","name":"_childTokenId","type":"uint256"}],"name":"rootOwnerOfChild","outputs":[{"internalType":"bytes32","name":"rootOwner","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"address","name":"_childContract","type":"address"},{"internalType":"uint256","name":"_childTokenId","type":"uint256"}],"name":"safeTransferChild","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"address","name":"_childContract","type":"address"},{"internalType":"uint256","name":"_childTokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferChild","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_newBaseURI","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"tokensIdsByOwner","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"totalChildContracts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"address","name":"_childContract","type":"address"}],"name":"totalChildTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"address","name":"_childContract","type":"address"},{"internalType":"uint256","name":"_childTokenId","type":"uint256"}],"name":"transferChild","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fromTokenId","type":"uint256"},{"internalType":"address","name":"_toContract","type":"address"},{"internalType":"uint256","name":"_toTokenId","type":"uint256"},{"internalType":"address","name":"_childContract","type":"address"},{"internalType":"uint256","name":"_childTokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"transferChildToParent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"unwrap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_rescueOrder","type":"uint256"}],"name":"wrap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"}]'], 
null), um = new r(null, 2, [Jh, "0x8d33303023723dE93b213da4EB53bE890e747C63", Lj, '[{"inputs": [],"stateMutability": "nonpayable","type": "constructor"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "accessoryId","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"indexed": false,"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"indexed": false,"internalType": "uint16","name": "zIndex","type": "uint16"}],"name": "AccessoryApplied","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "accessoryId","type": "uint256"},{"indexed": false,"internalType": "address","name": "creator","type": "address"},{"indexed": false,"internalType": "uint256","name": "price","type": "uint256"},{"indexed": false,"internalType": "uint16","name": "totalSupply","type": "uint16"},{"indexed": false,"internalType": "bytes30","name": "name","type": "bytes30"}],"name": "AccessoryCreated","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "AccessoryDiscontinued","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "accessoryId","type": "uint256"},{"indexed": false,"internalType": "address","name": "newManager","type": "address"}],"name": "AccessoryManagementTransferred","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "accessoryId","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "price","type": "uint256"}],"name": "AccessoryPriceChanged","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "accessoryId","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "price","type": "uint256"}],"name": "AccessoryPurchased","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "EligibleListCleared","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "EligibleListSet","type": "event"},{"inputs": [{"internalType": "uint256","name": "","type": "uint256"},{"internalType": "uint256","name": "","type": "uint256"}],"name": "AccessoriesByMoonCat","outputs": [{"internalType": "uint232","name": "accessoryId","type": "uint232"},{"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"internalType": "uint16","name": "zIndex","type": "uint16"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "accessoryEligibleList","outputs": [{"internalType": "bytes32[100]","name": "","type": "bytes32[100]"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "bytes32","name": "","type": "bytes32"}],"name": "accessoryHashes","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "accessoryImageData","outputs": [{"internalType": "bytes2[4]","name": "positions","type": "bytes2[4]"},{"internalType": "bytes8[7]","name": "palettes","type": "bytes8[7]"},{"internalType": "uint8","name": "width","type": "uint8"},{"internalType": "uint8","name": "height","type": "uint8"},{"internalType": "uint8","name": "meta","type": "uint8"},{"internalType": "bytes","name": "IDAT","type": "bytes"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "accessoryInfo","outputs": [{"internalType": "uint16","name": "totalSupply","type": "uint16"},{"internalType": "uint16","name": "availableSupply","type": "uint16"},{"internalType": "bytes28","name": "name","type": "bytes28"},{"internalType": "address","name": "manager","type": "address"},{"internalType": "uint8","name": "metabyte","type": "uint8"},{"internalType": "uint8","name": "availablePalettes","type": "uint8"},{"internalType": "bytes2[4]","name": "positions","type": "bytes2[4]"},{"internalType": "bool","name": "availableForPurchase","type": "bool"},{"internalType": "uint256","name": "price","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "uint256","name": "paletteIndex","type": "uint256"}],"name": "accessoryPalette","outputs": [{"internalType": "bytes8","name": "","type": "bytes8"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "accessoryPaletteCount","outputs": [{"internalType": "uint8","name": "","type": "uint8"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "bytes8","name": "newPalette","type": "bytes8"}],"name": "addAccessoryPalette","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"components": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint232","name": "ownedIndexOrAccessoryId","type": "uint232"},{"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"internalType": "uint16","name": "zIndex","type": "uint16"}],"internalType": "struct MoonCatAccessories.AccessoryBatchData[]","name": "alterations","type": "tuple[]"}],"name": "alterAccessories","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint256","name": "ownedAccessoryIndex","type": "uint256"},{"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"internalType": "uint16","name": "zIndex","type": "uint16"}],"name": "alterAccessory","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "manager","type": "address"}],"name": "balanceOf","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"}],"name": "balanceOf","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint8","name": "value","type": "uint8"},{"internalType": "uint256[]","name": "accessoryIds","type": "uint256[]"}],"name": "batchAndMetaByte","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint8","name": "value","type": "uint8"},{"internalType": "uint256[]","name": "accessoryIds","type": "uint256[]"}],"name": "batchOrMetaByte","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"components": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint232","name": "ownedIndexOrAccessoryId","type": "uint232"},{"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"internalType": "uint16","name": "zIndex","type": "uint16"}],"internalType": "struct MoonCatAccessories.AccessoryBatchData[]","name": "orders","type": "tuple[]"},{"internalType": "address payable","name": "referrer","type": "address"}],"name": "buyAccessories","outputs": [],"stateMutability": "payable","type": "function"},{"inputs": [{"components": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint232","name": "ownedIndexOrAccessoryId","type": "uint232"},{"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"internalType": "uint16","name": "zIndex","type": "uint16"}],"internalType": "struct MoonCatAccessories.AccessoryBatchData[]","name": "orders","type": "tuple[]"}],"name": "buyAccessories","outputs": [],"stateMutability": "payable","type": "function"},{"inputs": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"internalType": "uint16","name": "zIndex","type": "uint16"},{"internalType": "address payable","name": "referrer","type": "address"}],"name": "buyAccessory","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "payable","type": "function"},{"inputs": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"internalType": "uint16","name": "zIndex","type": "uint16"}],"name": "buyAccessory","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "payable","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "clearEligibleList","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint8[3]","name": "WHM","type": "uint8[3]"},{"internalType": "uint256","name": "priceWei","type": "uint256"},{"internalType": "uint16","name": "totalSupply","type": "uint16"},{"internalType": "bytes28","name": "name","type": "bytes28"},{"internalType": "bytes2[4]","name": "positions","type": "bytes2[4]"},{"internalType": "bytes8[]","name": "palettes","type": "bytes8[]"},{"internalType": "bytes","name": "IDAT","type": "bytes"},{"internalType": "bytes32[100]","name": "eligibleList","type": "bytes32[100]"}],"name": "createAccessory","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint8[3]","name": "WHM","type": "uint8[3]"},{"internalType": "uint256","name": "priceWei","type": "uint256"},{"internalType": "uint16","name": "totalSupply","type": "uint16"},{"internalType": "bytes28","name": "name","type": "bytes28"},{"internalType": "bytes2[4]","name": "positions","type": "bytes2[4]"},{"internalType": "bytes8[]","name": "palettes","type": "bytes8[]"},{"internalType": "bytes","name": "IDAT","type": "bytes"}],"name": "createAccessory","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "discontinueAccessory","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "doesMoonCatOwnAccessory","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "bool","name": "targetState","type": "bool"},{"internalType": "uint16[]","name": "rescueOrders","type": "uint16[]"}],"name": "editEligibleMoonCats","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "feeDenominator","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "freeze","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "frozen","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "bytes","name": "IDAT","type": "bytes"}],"name": "isAccessoryUnique","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "isEligible","outputs": [{"internalType": "bool","name": "","type": "bool"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address","name": "manager","type": "address"},{"internalType": "uint256","name": "managedAccessoryIndex","type": "uint256"}],"name": "managedAccessoryByIndex","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"internalType": "uint16","name": "zIndex","type": "uint16"}],"name": "managerApplyAccessory","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"}],"name": "managerOf","outputs": [{"internalType": "address","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "rescueOrder","type": "uint256"},{"internalType": "uint256","name": "ownedAccessoryIndex","type": "uint256"}],"name": "ownedAccessoryByIndex","outputs": [{"components": [{"internalType": "uint232","name": "accessoryId","type": "uint232"},{"internalType": "uint8","name": "paletteIndex","type": "uint8"},{"internalType": "uint16","name": "zIndex","type": "uint16"}],"internalType": "struct MoonCatAccessories.OwnedAccessory","name": "","type": "tuple"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "owner","outputs": [{"internalType": "address payable","name": "","type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "address payable","name": "manager","type": "address"},{"internalType": "uint8[3]","name": "WHM","type": "uint8[3]"},{"internalType": "uint256","name": "priceWei","type": "uint256"},{"internalType": "uint16","name": "totalSupply","type": "uint16"},{"internalType": "bytes28","name": "name","type": "bytes28"},{"internalType": "bytes2[4]","name": "positions","type": "bytes2[4]"},{"internalType": "bytes8[7]","name": "initialPalettes","type": "bytes8[7]"},{"internalType": "bytes","name": "IDAT","type": "bytes"},{"internalType": "bytes32[100]","name": "eligibleList","type": "bytes32[100]"}],"name": "ownerCreateAccessory","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address payable","name": "manager","type": "address"},{"internalType": "uint8[3]","name": "WHM","type": "uint8[3]"},{"internalType": "uint256","name": "priceWei","type": "uint256"},{"internalType": "uint16","name": "totalSupply","type": "uint16"},{"internalType": "bytes28","name": "name","type": "bytes28"},{"internalType": "bytes2[4]","name": "positions","type": "bytes2[4]"},{"internalType": "bytes8[7]","name": "initialPalettes","type": "bytes8[7]"},{"internalType": "bytes","name": "IDAT","type": "bytes"}],"name": "ownerCreateAccessory","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "referralDenominator","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "uint256","name": "newPriceWei","type": "uint256"}],"name": "setAccessoryPrice","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "bytes32[100]","name": "eligibleList","type": "bytes32[100]"}],"name": "setEligibleList","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint256","name": "denominator","type": "uint256"}],"name": "setFee","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "uint8","name": "metabyte","type": "uint8"}],"name": "setMetaByte","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint256","name": "denominator","type": "uint256"}],"name": "setReferralFee","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "bool","name": "active","type": "bool"}],"name": "toggleEligibleList","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "totalAccessories","outputs": [{"internalType": "uint256","name": "","type": "uint256"}],"stateMutability": "view","type": "function"},{"inputs": [{"internalType": "uint256","name": "accessoryId","type": "uint256"},{"internalType": "address payable","name": "newManager","type": "address"}],"name": "transferAccessoryManagement","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address payable","name": "newOwner","type": "address"}],"name": "transferOwnership","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [],"name": "unfreeze","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "tokenContract","type": "address"}],"name": "withdrawForeignERC20","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{"internalType": "address","name": "tokenContract","type": "address"},{"internalType": "uint256","name": "tokenId","type": "uint256"}],"name": "withdrawForeignERC721","outputs": [],"stateMutability": "nonpayable","type": "function"}]'], 
null), vm = new r(null, 2, [Jh, "0x0B78C64bCE6d6d4447e58b09E53F3621f44A2a48", Lj, '[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"MoonCatRescue","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"contractAddresses","type":"address[]"},{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"details","type":"string"}],"internalType":"struct MoonCatReference.Doc[]","name":"docs","type":"tuple[]"}],"name":"batchSetDocs","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"contractAddressByIndex","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_contractAddress","type":"address"}],"name":"doc","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"details","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"doc","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"details","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"doc","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"details","type":"string"},{"internalType":"address","name":"contractAddress","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"details","type":"string"}],"name":"setDoc","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"}],"name":"setDoc","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalContracts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"},{"internalType":"string","name":"details","type":"string"}],"name":"updateDetails","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"}],"name":"withdrawForeignERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"withdrawForeignERC721","outputs":[],"stateMutability":"nonpayable","type":"function"}]'], 
null), wm = new r(null, 2, [Jh, "0x9330BbfBa0C8FdAf0D93717E4405a410a6103cC2", Lj, '[{"inputs":[{"internalType":"address","name":"MoonCatReferenceAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"catIdOf","outputs":[{"internalType":"bytes5","name":"","type":"bytes5"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"doc","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"details","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"expressionNames","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"facingNames","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"kTraitsOf","outputs":[{"internalType":"bool","name":"genesis","type":"bool"},{"internalType":"bool","name":"pale","type":"bool"},{"internalType":"uint8","name":"facing","type":"uint8"},{"internalType":"uint8","name":"expression","type":"uint8"},{"internalType":"uint8","name":"pattern","type":"uint8"},{"internalType":"uint8","name":"pose","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"kTraitsOf","outputs":[{"internalType":"bool","name":"genesis","type":"bool"},{"internalType":"bool","name":"pale","type":"bool"},{"internalType":"uint8","name":"facing","type":"uint8"},{"internalType":"uint8","name":"expression","type":"uint8"},{"internalType":"uint8","name":"pattern","type":"uint8"},{"internalType":"uint8","name":"pose","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"nameOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"nameOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"patternNames","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"poseNames","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"rescueYearOf","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"proxyAddress","type":"address"},{"internalType":"bool","name":"isProxy","type":"bool"}],"name":"setERC721Proxy","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"referenceContract","type":"address"}],"name":"setReferenceContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"traitsOf","outputs":[{"internalType":"bool","name":"genesis","type":"bool"},{"internalType":"bool","name":"pale","type":"bool"},{"internalType":"string","name":"facing","type":"string"},{"internalType":"string","name":"expression","type":"string"},{"internalType":"string","name":"pattern","type":"string"},{"internalType":"string","name":"pose","type":"string"},{"internalType":"bytes5","name":"catId","type":"bytes5"},{"internalType":"uint16","name":"rescueYear","type":"uint16"},{"internalType":"bool","name":"isNamed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"traitsOf","outputs":[{"internalType":"bool","name":"genesis","type":"bool"},{"internalType":"bool","name":"pale","type":"bool"},{"internalType":"string","name":"facing","type":"string"},{"internalType":"string","name":"expression","type":"string"},{"internalType":"string","name":"pattern","type":"string"},{"internalType":"string","name":"pose","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"}],"name":"withdrawForeignERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"withdrawForeignERC721","outputs":[],"stateMutability":"nonpayable","type":"function"}]'], 
null), xm = new r(null, 2, [Jh, "0x2fd7E0c38243eA15700F45cfc38A7a7f66df1deC", Lj, '[{"inputs":[{"internalType":"address","name":"MoonCatReferenceAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"BasePalette","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"r","type":"uint256"},{"internalType":"uint256","name":"g","type":"uint256"},{"internalType":"uint256","name":"b","type":"uint256"}],"name":"RGBToHue","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"accessoryColorsOf","outputs":[{"internalType":"uint8[45]","name":"","type":"uint8[45]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"accessoryColorsOf","outputs":[{"internalType":"uint8[45]","name":"","type":"uint8[45]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"id","type":"uint8"}],"name":"colorAlpha","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"colorsOf","outputs":[{"internalType":"uint8[24]","name":"","type":"uint8[24]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"colorsOf","outputs":[{"internalType":"uint8[24]","name":"","type":"uint8[24]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"red","type":"uint8"},{"internalType":"uint8","name":"green","type":"uint8"},{"internalType":"uint8","name":"blue","type":"uint8"},{"internalType":"bool","name":"invert","type":"bool"}],"name":"deriveColors","outputs":[{"internalType":"uint8[24]","name":"","type":"uint8[24]"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"doc","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"details","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"finalize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"finalized","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"glowOf","outputs":[{"internalType":"uint8[3]","name":"","type":"uint8[3]"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"glowOf","outputs":[{"internalType":"uint8[3]","name":"","type":"uint8[3]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"hueIntOf","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"hueIntOf","outputs":[{"internalType":"uint16","name":"","type":"uint16"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint16","name":"hue","type":"uint16"}],"name":"hueName","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"hue","type":"uint256"},{"internalType":"uint8","name":"_lightness","type":"uint8"}],"name":"hueToRGB","outputs":[{"internalType":"uint8","name":"","type":"uint8"},{"internalType":"uint8","name":"","type":"uint8"},{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes5[]","name":"keys","type":"bytes5[]"},{"internalType":"uint128[]","name":"vals","type":"uint128[]"}],"name":"mapColors","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"paletteOf","outputs":[{"internalType":"uint8[384]","name":"","type":"uint8[384]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"paletteOf","outputs":[{"internalType":"uint8[384]","name":"","type":"uint8[384]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"referenceContract","type":"address"}],"name":"setReferenceContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"}],"name":"withdrawForeignERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"withdrawForeignERC721","outputs":[],"stateMutability":"nonpayable","type":"function"}]'], 
null), ym = new r(null, 2, [Jh, "0xB39C61fe6281324A23e079464f7E697F8Ba6968f", Lj, '[{"inputs":[{"internalType":"address","name":"MoonCatReferenceAddress","type":"address"},{"internalType":"address","name":"MoonCatTraitsAddress","type":"address"},{"internalType":"address","name":"MoonCatColorsAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"Border","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"CatBox","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"Coat","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"Eyes","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"Face","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"Patterns","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"Skin","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"Tummy","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"Whiskers","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"facing","type":"uint8"},{"internalType":"uint8","name":"pose","type":"uint8"}],"name":"boundingBox","outputs":[{"internalType":"uint8","name":"x","type":"uint8"},{"internalType":"uint8","name":"y","type":"uint8"},{"internalType":"uint8","name":"width","type":"uint8"},{"internalType":"uint8","name":"height","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"doc","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"details","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"svgData","type":"bytes"}],"name":"flip","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint8","name":"pose","type":"uint8"},{"internalType":"uint8","name":"pattern","type":"uint8"}],"name":"getPattern","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"facing","type":"uint8"},{"internalType":"uint8","name":"expression","type":"uint8"},{"internalType":"uint8","name":"pose","type":"uint8"},{"internalType":"uint8","name":"pattern","type":"uint8"},{"internalType":"uint8[24]","name":"colors","type":"uint8[24]"}],"name":"getPixelData","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"pixels","type":"bytes"},{"internalType":"uint8","name":"r","type":"uint8"},{"internalType":"uint8","name":"g","type":"uint8"},{"internalType":"uint8","name":"b","type":"uint8"}],"name":"glowGroup","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"},{"internalType":"bool","name":"glow","type":"bool"}],"name":"imageOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"},{"internalType":"bool","name":"glow","type":"bool"}],"name":"imageOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes5","name":"catId","type":"bytes5"}],"name":"imageOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"imageOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8[]","name":"data","type":"uint8[]"},{"internalType":"uint8","name":"index","type":"uint8"}],"name":"pixelGroup","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"referenceContract","type":"address"}],"name":"setReferenceContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"x","type":"uint8"},{"internalType":"uint8","name":"y","type":"uint8"},{"internalType":"uint8","name":"w","type":"uint8"},{"internalType":"uint8","name":"h","type":"uint8"}],"name":"svgTag","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"uint2str","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"}],"name":"withdrawForeignERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"withdrawForeignERC721","outputs":[],"stateMutability":"nonpayable","type":"function"}]'], 
null), zm = new r(null, 2, [Jh, "0x91CF36c92fEb5c11D3F5fe3e8b9e212f7472Ec14", Lj, '[{"inputs":[{"internalType":"address","name":"MoonCatReferenceAddress","type":"address"},{"internalType":"address","name":"MoonCatTraitsAddress","type":"address"},{"internalType":"address","name":"MoonCatColorsAddress","type":"address"},{"internalType":"address","name":"MoonCatSVGsAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"PNGFooter","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PNGHeader","outputs":[{"internalType":"uint64","name":"","type":"uint64"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"accessorizedImageOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"},{"internalType":"uint8","name":"glowLevel","type":"uint8"},{"internalType":"bool","name":"allowUnverified","type":"bool"}],"name":"accessorizedImageOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"},{"components":[{"internalType":"uint232","name":"accessoryId","type":"uint232"},{"internalType":"uint8","name":"paletteIndex","type":"uint8"},{"internalType":"uint16","name":"zIndex","type":"uint16"}],"internalType":"struct IMoonCatAccessories.OwnedAccessory[]","name":"accessories","type":"tuple[]"},{"internalType":"uint8","name":"glowLevel","type":"uint8"},{"internalType":"bool","name":"allowUnverified","type":"bool"}],"name":"accessorizedImageOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"},{"internalType":"uint8","name":"glowLevel","type":"uint8"}],"name":"accessorizedImageOf","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"},{"internalType":"uint256","name":"accessoryId","type":"uint256"},{"internalType":"uint16","name":"paletteIndex","type":"uint16"}],"name":"accessoryPNG","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"data","type":"bytes"}],"name":"crc32","outputs":[{"internalType":"uint32","name":"","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"doc","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"details","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"typeCode","type":"string"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"generatePNGChunk","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"},{"internalType":"uint256","name":"accessoryId","type":"uint256"}],"name":"placementOf","outputs":[{"internalType":"uint8","name":"offsetX","type":"uint8"},{"internalType":"uint8","name":"offsetY","type":"uint8"},{"internalType":"uint8","name":"width","type":"uint8"},{"internalType":"uint8","name":"height","type":"uint8"},{"internalType":"bool","name":"mirror","type":"bool"},{"internalType":"bool","name":"background","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"},{"internalType":"uint8","name":"facing","type":"uint8"},{"internalType":"uint8","name":"pose","type":"uint8"},{"internalType":"bool","name":"allowUnverified","type":"bool"},{"components":[{"internalType":"uint232","name":"accessoryId","type":"uint232"},{"internalType":"uint8","name":"paletteIndex","type":"uint8"},{"internalType":"uint16","name":"zIndex","type":"uint16"}],"internalType":"struct IMoonCatAccessories.OwnedAccessory[]","name":"accessories","type":"tuple[]"}],"name":"prepAccessories","outputs":[{"components":[{"internalType":"uint16","name":"zIndex","type":"uint16"},{"internalType":"uint8","name":"offsetX","type":"uint8"},{"internalType":"uint8","name":"offsetY","type":"uint8"},{"internalType":"uint8","name":"width","type":"uint8"},{"internalType":"uint8","name":"height","type":"uint8"},{"internalType":"bool","name":"mirror","type":"bool"},{"internalType":"bool","name":"background","type":"bool"},{"internalType":"bytes8","name":"palette","type":"bytes8"},{"internalType":"bytes","name":"IDAT","type":"bytes"}],"internalType":"struct MoonCatAccessoryImages.PreppedAccessory[]","name":"","type":"tuple[]"},{"components":[{"internalType":"uint16","name":"zIndex","type":"uint16"},{"internalType":"uint8","name":"offsetX","type":"uint8"},{"internalType":"uint8","name":"offsetY","type":"uint8"},{"internalType":"uint8","name":"width","type":"uint8"},{"internalType":"uint8","name":"height","type":"uint8"},{"internalType":"bool","name":"mirror","type":"bool"},{"internalType":"bool","name":"background","type":"bool"},{"internalType":"bytes8","name":"palette","type":"bytes8"},{"internalType":"bytes","name":"IDAT","type":"bytes"}],"internalType":"struct MoonCatAccessoryImages.PreppedAccessory[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"referenceContract","type":"address"}],"name":"setReferenceContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"}],"name":"withdrawForeignERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"withdrawForeignERC721","outputs":[],"stateMutability":"nonpayable","type":"function"}]'], 
null), Am = new r(null, 2, [Jh, "0x1e9385eE28c5C7d33F3472f732Fb08CE3ceBce1F", Lj, '[{"inputs":[{"internalType":"address","name":"metadataContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"Lootprints","outputs":[{"internalType":"uint16","name":"index","type":"uint16"},{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"Metadata","outputs":[{"internalType":"contract IMoonCatLootprintsMetadata","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"lootprintId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"contractOwner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"decodeColor","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"freeze","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"frozen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"lootprintId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"operator","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"lootprintId","type":"uint256"}],"name":"getDetails","outputs":[{"internalType":"uint8","name":"status","type":"uint8"},{"internalType":"string","name":"class","type":"string"},{"internalType":"uint8","name":"bays","type":"uint8"},{"internalType":"string","name":"colorName","type":"string"},{"internalType":"string","name":"shipName","type":"string"},{"internalType":"address","name":"tokenOwner","type":"address"},{"internalType":"uint32","name":"seed","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"lootprintId","type":"uint256"}],"name":"imageURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"rescueOrders","type":"uint256[]"},{"internalType":"address","name":"to","type":"address"}],"name":"mintMultiple","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"rescueOrders","type":"uint256[]"}],"name":"mintMultiple","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"mintingWindowOpen","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"lootprintId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"owner","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rescueOrder","type":"uint256"}],"name":"paidMint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"pendingRevealCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"permanentlyCloseMintingWindow","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"seedHash","type":"bytes32"}],"name":"prepReveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"price","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"revealSeed","type":"uint256"}],"name":"reveal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"lootprintId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"lootprintId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"table","type":"bytes32[]"},{"internalType":"uint256","name":"startAt","type":"uint256"}],"name":"setColorTable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"metadataContract","type":"address"}],"name":"setMetadataContract","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32[100]","name":"noChargeList","type":"bytes32[100]"}],"name":"setNoChargeList","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"priceWei","type":"uint256"}],"name":"setPrice","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bool","name":"groupTwo","type":"bool"}],"name":"setupHeroShips","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"lootprintId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"lootprintId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unfreeze","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"}],"name":"withdrawForeignERC20","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenContract","type":"address"},{"internalType":"uint256","name":"lootprintId","type":"uint256"}],"name":"withdrawForeignERC721","outputs":[],"stateMutability":"nonpayable","type":"function"}]'], 
null);
tg([Ch, Kh, ei, pi, vi, Qi, Ri, uj, Kj, Bk], [wm, sm, Am, rm, zm, xm, um, ym, vm, tm]);
function Bm(a) {
  return pd.m(a, ij, Lj.h(a), gd([Lj, JSON.parse(Lj.h(a))]));
}
var Cm = kh(tg("LootprintsForMooncats MoonCatTraits MoonCatAcclimator MoonCatColors DeprecatedUnofficialMoonCatWrapper MoonCatAccessories MoonCatAccessoryImages MoonCatRescue MoonCatSvgs MoonCatReference".split(" "), [Bm(Am), Bm(wm), Bm(tm), Bm(xm), Bm(sm), Bm(um), Bm(zm), Bm(rm), Bm(ym), Bm(vm)]));
function Dm(a, b) {
  var c = De(b), d = w.g(c, Oh);
  return fm(a, Jh.h(tm), function() {
    var e = De(new r(null, 1, [Ni, d], null)), f = w.g(e, Ni);
    e = L;
    var g = Qe();
    f = g.h ? g.h(f) : g.call(null, f);
    e = new K(null, 1, 5, e, [im(f)], null);
    return ["0x6352211e", jl(e)].join("");
  }()).then(function(e) {
    return new Promise(function(f, g) {
      return t(vj.h(e)) ? (g = Cj.h(e), g = mm(om(g, 0)), g = pd.m(c, Qk, g, gd([Uj, !0, Ai, new r(null, 4, [Ni, d, zh, "MoonCatAcclimator", Jh, Jh.h(tm), Eh, new K(null, 3, 5, L, ["ERC20", "ERC721", "ERC998"], null)], null)])), f.h ? f.h(g) : f.call(null, g)) : g.h ? g.h(e) : g.call(null, e);
    });
  });
}
function Em(a, b) {
  return fm(a, Jh.h(rm), function() {
    var c = De(new r(null, 1, [Qh, b], null));
    c = w.g(c, Qh);
    c = new K(null, 1, 5, L, [im(nl(c))], null);
    return ["0x2f598404", jl(c)].join("");
  }()).then(function(c) {
    return new Promise(function(d, e) {
      if (t(vj.h(c))) {
        var f = Cj.h(c);
        e = function() {
          var g = mm(om(f, 1)), k = new r(null, 4, [Qh, ["0x", be(om(f, 0), 0, 10)].join(""), Oh, wl.h ? wl.h(b) : wl.call(null, b), Uj, !1, Kk, nm(om(f, 2))], null);
          return t(function() {
            var l = Jh.h(tm);
            return E.g ? E.g(l, g) : E.call(null, l, g);
          }()) ? Dm(a, k) : t(function() {
            var l = Jh.h(sm);
            return E.g ? E.g(l, g) : E.call(null, l, g);
          }()) ? pd.i(k, Ai, new r(null, 3, [zh, "Unsupported Unofficial MoonCat Wrapper", Jh, Jh.h(sm), qj, "Unsupported Contract"], null)) : pd.m(k, Qk, g, gd([Ai, new r(null, 4, [Ni, b, zh, "MoonCatRescue", Jh, Jh.h(rm), Eh, new K(null, 1, 5, L, ["ERC20"], null)], null)]));
        }();
        return d.h ? d.h(e) : d.call(null, e);
      }
      return e.h ? e.h(c) : e.call(null, c);
    });
  });
}
function Fm(a, b) {
  return fm(a, Jh.h(rm), function() {
    var c = De(new r(null, 1, [Qh, b], null));
    c = w.g(c, Qh);
    c = new K(null, 1, 5, L, [im(nl(c))], null);
    return ["0x2f598404", jl(c)].join("");
  }()).then(function(c) {
    return new Promise(function(d, e) {
      return t(vj.h(c)) ? (e = Cj.h(c), e = E.g(mm(om(e, 1)), Jh.h(tm)), d.h ? d.h(e) : d.call(null, e)) : e.h ? e.h(c) : e.call(null, c);
    });
  });
}
function Gm(a) {
  var b = Jh.h(um);
  De(null);
  var c = ["0xe7718594", jl(ld)].join("");
  return fm(a, b, c).then(function(d) {
    return new Promise(function(e, f) {
      return t(vj.h(d)) ? (f = Cj.h(d), f = jm(om(f, 0)), e.h ? e.h(f) : e.call(null, f)) : f.h ? f.h(d) : f.call(null, d);
    });
  });
}
function Hm(a, b) {
  return fm(a, Jh.h(um), function() {
    var c = De(new r(null, 1, [Ci, b], null)), d = w.g(c, Ci);
    c = L;
    var e = Qe();
    d = e.h ? e.h(d) : e.call(null, d);
    c = new K(null, 1, 5, c, [im(d)], null);
    return ["0x0b7dd23a", jl(c)].join("");
  }()).then(function(c) {
    return new Promise(function(d, e) {
      if (t(vj.h(c))) {
        e = Cj.h(c);
        var f = jm(om(e, 11));
        e = tg([Ah, Na, zi, rj, sj, Bj, rk, Fk, Lk, Xk], [lm(om(e, 1)), lm(om(e, 4)), nm(om(e, 2)), f, mm(om(e, 3)), lm(om(e, 0)), E.g("1", om(e, 10).substring(63, 64)), lm(om(e, 5)), km(f), qm(pm(e, 6, 4))]);
        return d.h ? d.h(e) : d.call(null, e);
      }
      return e.h ? e.h(c) : e.call(null, c);
    });
  });
}
function Im(a, b) {
  return fm(a, Jh.h(um), function() {
    var c = De(new r(null, 1, [Ci, b], null)), d = w.g(c, Ci);
    c = L;
    var e = Qe();
    d = e.h ? e.h(d) : e.call(null, d);
    c = new K(null, 1, 5, c, [im(d)], null);
    return ["0xf9585a65", jl(c)].join("");
  }()).then(function(c) {
    return new Promise(function(d, e) {
      if (t(vj.h(c))) {
        e = Cj.h(c);
        var f = 66 + 2 * lm(om(e, 14)), g = 2 * lm(om(e, 15)), k = qm(pm(e, 0, 4));
        a: {
          for (var l = pm(e, 4, 7), m = 0, n = ld;;) {
            if (7 === m) {
              break a;
            }
            var q = m + 1;
            m = l.substring(64 * m, 64 * (m + 1));
            n = jd.g(n, new K(null, 8, 5, L, [lm(m.substring(0, 2)), lm(m.substring(2, 4)), lm(m.substring(4, 6)), lm(m.substring(6, 8)), lm(m.substring(8, 10)), lm(m.substring(10, 12)), lm(m.substring(12, 14)), lm(m.substring(14, 16))], null));
            m = q;
          }
        }
        e = new r(null, 6, [Xk, k, Vh, n, O, lm(om(e, 11)), W, lm(om(e, 12)), Na, lm(om(e, 13)), si, ["0x", e.substring(f, f + g)].join("")], null);
        return d.h ? d.h(e) : d.call(null, e);
      }
      return e.h ? e.h(c) : e.call(null, c);
    });
  });
}
function Jm(a, b) {
  return fm(a, Jh.h(um), function() {
    var c = De(new r(null, 1, [Ci, b], null)), d = w.g(c, Ci);
    c = L;
    var e = Qe();
    d = e.h ? e.h(d) : e.call(null, d);
    c = new K(null, 1, 5, c, [im(d)], null);
    return ["0xedfc47c8", jl(c)].join("");
  }()).then(function(c) {
    return new Promise(function(d, e) {
      return t(vj.h(c)) ? (e = Cj.h(c), e = kf(function(f) {
        return ["0x", u.h(f)].join("");
      }, Ng(/.{64}/, e.substring(2))), d.h ? d.h(e) : d.call(null, e)) : e.h ? e.h(c) : e.call(null, c);
    });
  });
}
function Km(a, b) {
  return Hm(a, b).then(function(c) {
    return Im(a, b).then(function(d) {
      return Jm(a, b).then(function(e) {
        return new Promise(function(f) {
          var g = pd.i(yg(gd([c, d])), gk, e);
          return f.h ? f.h(g) : f.call(null, g);
        });
      });
    });
  });
}
function Lm(a, b) {
  return fm(a, Jh.h(um), function() {
    var c = De(new r(null, 1, [Jh, b], null)), d = w.g(c, Jh);
    c = L;
    var e = Pe.g(hm, nl);
    d = e.h ? e.h(d) : e.call(null, d);
    c = new K(null, 1, 5, c, [im(d)], null);
    return ["0x70a08231", jl(c)].join("");
  }()).then(function(c) {
    return new Promise(function(d, e) {
      return t(vj.h(c)) ? (e = Cj.h(c), e = lm(om(e, 0)), d.h ? d.h(e) : d.call(null, e)) : e.h ? e.h(c) : e.call(null, c);
    });
  });
}
function Mm(a, b, c) {
  var d = function() {
    return function(e) {
      e = De(e);
      var f = w.g(e, Jh), g = w.g(e, hi);
      e = new K(null, 2, 5, L, [im(function() {
        var k = Pe.g(hm, nl);
        return k.h ? k.h(f) : k.call(null, f);
      }()), im(function() {
        var k = Qe();
        return k.h ? k.h(g) : k.call(null, g);
      }())], null);
      return ["0xaedd83fa", jl(e)].join("");
    }(new r(null, 2, [Jh, b, hi, c], null));
  }();
  return fm(a, Jh.h(um), d).then(function(e) {
    return new Promise(function(f, g) {
      return t(vj.h(e)) ? (g = Cj.h(e), g = lm(om(g, 0)), f.h ? f.h(g) : f.call(null, g)) : g.h ? g.h(e) : g.call(null, e);
    });
  });
}
function Nm(a, b) {
  return fm(a, Jh.h(um), function() {
    var c = De(new r(null, 1, [Oh, b], null)), d = w.g(c, Oh);
    c = L;
    var e = Qe();
    d = e.h ? e.h(d) : e.call(null, d);
    c = new K(null, 1, 5, c, [im(d)], null);
    return ["0x9cc7f708", jl(c)].join("");
  }()).then(function(c) {
    return new Promise(function(d, e) {
      return t(vj.h(c)) ? (e = Cj.h(c), e = lm(om(e, 0)), d.h ? d.h(e) : d.call(null, e)) : e.h ? e.h(c) : e.call(null, c);
    });
  });
}
function Om(a, b, c) {
  return fm(a, Jh.h(um), function() {
    return function(d) {
      d = De(d);
      var e = w.g(d, Oh), f = w.g(d, xi);
      d = new K(null, 2, 5, L, [im(function() {
        var g = Qe();
        return g.h ? g.h(e) : g.call(null, e);
      }()), im(function() {
        var g = Qe();
        return g.h ? g.h(f) : g.call(null, f);
      }())], null);
      return ["0x8e4aee06", jl(d)].join("");
    }(new r(null, 2, [Oh, b, xi, c], null));
  }()).then(function(d) {
    return new Promise(function(e, f) {
      return t(vj.h(d)) ? (f = Cj.h(d), f = new r(null, 3, [Ci, jm(om(f, 0)), Ik, lm(om(f, 1)), Od, lm(om(f, 2))], null), e.h ? e.h(f) : e.call(null, f)) : f.h ? f.h(d) : f.call(null, d);
    });
  });
}
function Pm(a, b, c) {
  return Om(a, b, c).then(function(d) {
    return Im(a, Ci.h(d)).then(function(e) {
      return new Promise(function(f) {
        var g = yg(gd([d, e]));
        return f.h ? f.h(g) : f.call(null, g);
      });
    });
  });
}
;var Qm = M([new r(null, 3, [S, 0, N, new K(null, 4, 5, L, [255, 255, 255, 0], null), R, "Transparent Background"], null), new r(null, 3, [S, 1, N, new K(null, 4, 5, L, [255, 255, 255, 255], null), R, "White"], null), new r(null, 3, [S, 2, N, new K(null, 4, 5, L, [212, 212, 212, 255], null), R, "Pale Grey"], null), new r(null, 3, [S, 3, N, new K(null, 4, 5, L, [170, 170, 170, 255], null), R, "Light Grey"], null), new r(null, 3, [S, 4, N, new K(null, 4, 5, L, [128, 128, 128, 255], null), R, "Grey"], 
null), new r(null, 3, [S, 5, N, new K(null, 4, 5, L, [85, 85, 85, 255], null), R, "Dark Grey"], null), new r(null, 3, [S, 6, N, new K(null, 4, 5, L, [42, 42, 42, 255], null), R, "Deep Grey"], null), new r(null, 3, [S, 7, N, new K(null, 4, 5, L, [0, 0, 0, 255], null), R, "Black"], null), new r(null, 3, [S, 8, N, new K(null, 4, 5, L, [249, 134, 134, 255], null), R, "Light Red"], null), new r(null, 3, [S, 9, N, new K(null, 4, 5, L, [242, 13, 13, 255], null), R, "Red"], null), new r(null, 3, [S, 10, 
N, new K(null, 4, 5, L, [161, 8, 8, 255], null), R, "Dark Red"], null), new r(null, 3, [S, 11, N, new K(null, 4, 5, L, [249, 178, 134, 255], null), R, "Light Orange"], null), new r(null, 3, [S, 12, N, new K(null, 4, 5, L, [242, 101, 13, 255], null), R, "Orange"], null), new r(null, 3, [S, 13, N, new K(null, 4, 5, L, [161, 67, 8, 255], null), R, "Dark Orange"], null), new r(null, 3, [S, 14, N, new K(null, 4, 5, L, [249, 220, 134, 255], null), R, "Light Gold"], null), new r(null, 3, [S, 15, N, new K(null, 
4, 5, L, [242, 185, 13, 255], null), R, "Gold"], null), new r(null, 3, [S, 16, N, new K(null, 4, 5, L, [161, 123, 8, 255], null), R, "Dark Gold"], null), new r(null, 3, [S, 17, N, new K(null, 4, 5, L, [249, 249, 134, 255], null), R, "Light Yellow"], null), new r(null, 3, [S, 18, N, new K(null, 4, 5, L, [242, 242, 13, 255], null), R, "Yellow"], null), new r(null, 3, [S, 19, N, new K(null, 4, 5, L, [161, 161, 8, 255], null), R, "Dark Yellow"], null), new r(null, 3, [S, 20, N, new K(null, 4, 5, L, [210, 
249, 134, 255], null), R, "Light Chartreuse"], null), new r(null, 3, [S, 21, N, new K(null, 4, 5, L, [166, 242, 13, 255], null), R, "Chartreuse"], null), new r(null, 3, [S, 22, N, new K(null, 4, 5, L, [110, 161, 8, 255], null), R, "Dark Chartreuse"], null), new r(null, 3, [S, 23, N, new K(null, 4, 5, L, [134, 249, 134, 255], null), R, "Light Green"], null), new r(null, 3, [S, 24, N, new K(null, 4, 5, L, [13, 242, 13, 255], null), R, "Green"], null), new r(null, 3, [S, 25, N, new K(null, 4, 5, L, 
[8, 161, 8, 255], null), R, "Dark Green"], null), new r(null, 3, [S, 26, N, new K(null, 4, 5, L, [134, 249, 205, 255], null), R, "Light Teal"], null), new r(null, 3, [S, 27, N, new K(null, 4, 5, L, [13, 242, 154, 255], null), R, "Teal"], null), new r(null, 3, [S, 28, N, new K(null, 4, 5, L, [8, 161, 103, 255], null), R, "Dark Teal"], null), new r(null, 3, [S, 29, N, new K(null, 4, 5, L, [134, 249, 249, 255], null), R, "Light Cyan"], null), new r(null, 3, [S, 30, N, new K(null, 4, 5, L, [13, 242, 
242, 255], null), R, "Cyan"], null), new r(null, 3, [S, 31, N, new K(null, 4, 5, L, [8, 161, 161, 255], null), R, "Dark Cyan"], null), new r(null, 3, [S, 32, N, new K(null, 4, 5, L, [134, 205, 249, 255], null), R, "Light Sky Blue"], null), new r(null, 3, [S, 33, N, new K(null, 4, 5, L, [13, 154, 242, 255], null), R, "Sky Blue"], null), new r(null, 3, [S, 34, N, new K(null, 4, 5, L, [8, 103, 161, 255], null), R, "Dark Sky Blue"], null), new r(null, 3, [S, 35, N, new K(null, 4, 5, L, [134, 134, 249, 
255], null), R, "Light Blue"], null), new r(null, 3, [S, 36, N, new K(null, 4, 5, L, [13, 13, 242, 255], null), R, "Blue"], null), new r(null, 3, [S, 37, N, new K(null, 4, 5, L, [8, 8, 161, 255], null), R, "Dark Blue"], null), new r(null, 3, [S, 38, N, new K(null, 4, 5, L, [182, 134, 249, 255], null), R, "Light Indigo"], null), new r(null, 3, [S, 39, N, new K(null, 4, 5, L, [108, 13, 242, 255], null), R, "Indigo"], null), new r(null, 3, [S, 40, N, new K(null, 4, 5, L, [72, 8, 161, 255], null), R, 
"Dark Indigo"], null), new r(null, 3, [S, 41, N, new K(null, 4, 5, L, [210, 134, 249, 255], null), R, "Light Purple"], null), new r(null, 3, [S, 42, N, new K(null, 4, 5, L, [166, 13, 242, 255], null), R, "Purple"], null), new r(null, 3, [S, 43, N, new K(null, 4, 5, L, [110, 8, 161, 255], null), R, "Dark Purple"], null), new r(null, 3, [S, 44, N, new K(null, 4, 5, L, [235, 134, 249, 255], null), R, "Light Violet"], null), new r(null, 3, [S, 45, N, new K(null, 4, 5, L, [215, 13, 242, 255], null), R, 
"Violet"], null), new r(null, 3, [S, 46, N, new K(null, 4, 5, L, [144, 8, 161, 255], null), R, "Dark Violet"], null), new r(null, 3, [S, 47, N, new K(null, 4, 5, L, [249, 134, 210, 255], null), R, "Light Pink"], null), new r(null, 3, [S, 48, N, new K(null, 4, 5, L, [242, 13, 166, 255], null), R, "Pink"], null), new r(null, 3, [S, 49, N, new K(null, 4, 5, L, [161, 8, 110, 255], null), R, "Dark Pink"], null), new r(null, 3, [S, 50, N, new K(null, 4, 5, L, [65, 22, 22, 255], null), R, "Deep Red"], null), 
new r(null, 3, [S, 51, N, new K(null, 4, 5, L, [65, 54, 22, 255], null), R, "Deep Yellow"], null), new r(null, 3, [S, 52, N, new K(null, 4, 5, L, [43, 65, 22, 255], null), R, "Deep Green"], null), new r(null, 3, [S, 53, N, new K(null, 4, 5, L, [22, 65, 48, 255], null), R, "Deep Teal"], null), new r(null, 3, [S, 54, N, new K(null, 4, 5, L, [22, 33, 65, 255], null), R, "Deep Blue"], null), new r(null, 3, [S, 55, N, new K(null, 4, 5, L, [43, 22, 65, 255], null), R, "Deep Purple"], null), new r(null, 
3, [S, 56, N, new K(null, 4, 5, L, [65, 22, 54, 255], null), R, "Deep Pink"], null), new r(null, 3, [S, 57, N, new K(null, 4, 5, L, [236, 198, 198, 255], null), R, "Pale Red"], null), new r(null, 3, [S, 58, N, new K(null, 4, 5, L, [236, 221, 198, 255], null), R, "Pale Yellow"], null), new r(null, 3, [S, 59, N, new K(null, 4, 5, L, [202, 236, 198, 255], null), R, "Pale Green"], null), new r(null, 3, [S, 60, N, new K(null, 4, 5, L, [198, 236, 236, 255], null), R, "Pale Teal"], null), new r(null, 3, 
[S, 61, N, new K(null, 4, 5, L, [198, 217, 236, 255], null), R, "Pale Blue"], null), new r(null, 3, [S, 62, N, new K(null, 4, 5, L, [217, 198, 236, 255], null), R, "Pale Purple"], null), new r(null, 3, [S, 63, N, new K(null, 4, 5, L, [236, 198, 226, 255], null), R, "Pale Pink"], null), new r(null, 3, [S, 64, N, new K(null, 4, 5, L, [56, 43, 31, 255], null), R, "Umber"], null), new r(null, 3, [S, 65, N, new K(null, 4, 5, L, [72, 47, 25, 255], null), R, "Mocha"], null), new r(null, 3, [S, 66, N, new K(null, 
4, 5, L, [101, 62, 29, 255], null), R, "Cinnamon"], null), new r(null, 3, [S, 67, N, new K(null, 4, 5, L, [130, 79, 35, 255], null), R, "Brown"], null), new r(null, 3, [S, 68, N, new K(null, 4, 5, L, [153, 96, 46, 255], null), R, "Peanut"], null), new r(null, 3, [S, 69, N, new K(null, 4, 5, L, [184, 132, 86, 255], null), R, "Tortilla"], null), new r(null, 3, [S, 70, N, new K(null, 4, 5, L, [218, 192, 169, 255], null), R, "Beige"], null), new r(null, 3, [S, 71, N, new K(null, 4, 5, L, [255, 255, 255, 
200], null), R, "White Glass"], null), new r(null, 3, [S, 72, N, new K(null, 4, 5, L, [212, 212, 212, 200], null), R, "Pale Grey Glass"], null), new r(null, 3, [S, 73, N, new K(null, 4, 5, L, [170, 170, 170, 200], null), R, "Light Grey Glass"], null), new r(null, 3, [S, 74, N, new K(null, 4, 5, L, [128, 128, 128, 200], null), R, "Grey Glass"], null), new r(null, 3, [S, 75, N, new K(null, 4, 5, L, [85, 85, 85, 200], null), R, "Dark Grey Glass"], null), new r(null, 3, [S, 76, N, new K(null, 4, 5, L, 
[42, 42, 42, 200], null), R, "Deep Grey Glass"], null), new r(null, 3, [S, 77, N, new K(null, 4, 5, L, [0, 0, 0, 200], null), R, "Black Glass"], null), new r(null, 3, [S, 78, N, new K(null, 4, 5, L, [242, 13, 13, 200], null), R, "Vibrant Red Smoked Glass"], null), new r(null, 3, [S, 79, N, new K(null, 4, 5, L, [108, 19, 19, 200], null), R, "Dull Red Smoked Glass"], null), new r(null, 3, [S, 80, N, new K(null, 4, 5, L, [242, 185, 13, 200], null), R, "Vibrant Yellow Smoked Glass"], null), new r(null, 
3, [S, 81, N, new K(null, 4, 5, L, [108, 86, 19, 200], null), R, "Dull Yellow Smoked Glass"], null), new r(null, 3, [S, 82, N, new K(null, 4, 5, L, [128, 242, 13, 200], null), R, "Vibrant Green Smoked Glass"], null), new r(null, 3, [S, 83, N, new K(null, 4, 5, L, [64, 108, 19, 200], null), R, "Dull Green Smoked Glass"], null), new r(null, 3, [S, 84, N, new K(null, 4, 5, L, [13, 242, 154, 200], null), R, "Vibrant Teal Smoked Glass"], null), new r(null, 3, [S, 85, N, new K(null, 4, 5, L, [19, 108, 
74, 200], null), R, "Dull Teal Smoked Glass"], null), new r(null, 3, [S, 86, N, new K(null, 4, 5, L, [13, 70, 242, 200], null), R, "Vibrant Blue Smoked Glass"], null), new r(null, 3, [S, 87, N, new K(null, 4, 5, L, [19, 41, 108, 200], null), R, "Dull Blue Smoked Glass"], null), new r(null, 3, [S, 88, N, new K(null, 4, 5, L, [127, 13, 242, 200], null), R, "Vibrant Purple Smoked Glass"], null), new r(null, 3, [S, 89, N, new K(null, 4, 5, L, [64, 19, 108, 200], null), R, "Dull Purple Smoked Glass"], 
null), new r(null, 3, [S, 90, N, new K(null, 4, 5, L, [242, 13, 185, 200], null), R, "Vibrant Pink Smoked Glass"], null), new r(null, 3, [S, 91, N, new K(null, 4, 5, L, [108, 19, 86, 200], null), R, "Dull Pink Smoked Glass"], null), new r(null, 3, [S, 92, N, new K(null, 4, 5, L, [242, 13, 13, 128], null), R, "Vibrant Red Stained Glass"], null), new r(null, 3, [S, 93, N, new K(null, 4, 5, L, [108, 19, 19, 128], null), R, "Dull Red Stained Glass"], null), new r(null, 3, [S, 94, N, new K(null, 4, 5, 
L, [242, 185, 13, 128], null), R, "Vibrant Yellow Stained Glass"], null), new r(null, 3, [S, 95, N, new K(null, 4, 5, L, [108, 86, 19, 128], null), R, "Dull Yellow Stained Glass"], null), new r(null, 3, [S, 96, N, new K(null, 4, 5, L, [128, 242, 13, 128], null), R, "Vibrant Green Stained Glass"], null), new r(null, 3, [S, 97, N, new K(null, 4, 5, L, [64, 108, 19, 128], null), R, "Dull Green Stained Glass"], null), new r(null, 3, [S, 98, N, new K(null, 4, 5, L, [13, 242, 154, 128], null), R, "Vibrant Teal Stained Glass"], 
null), new r(null, 3, [S, 99, N, new K(null, 4, 5, L, [19, 108, 74, 128], null), R, "Dull Teal Stained Glass"], null), new r(null, 3, [S, 100, N, new K(null, 4, 5, L, [13, 70, 242, 128], null), R, "Vibrant Blue Stained Glass"], null), new r(null, 3, [S, 101, N, new K(null, 4, 5, L, [19, 41, 108, 128], null), R, "Dull Blue Stained Glass"], null), new r(null, 3, [S, 102, N, new K(null, 4, 5, L, [127, 13, 242, 128], null), R, "Vibrant Purple Stained Glass"], null), new r(null, 3, [S, 103, N, new K(null, 
4, 5, L, [64, 19, 108, 128], null), R, "Dull Purple Stained Glass"], null), new r(null, 3, [S, 104, N, new K(null, 4, 5, L, [242, 13, 185, 128], null), R, "Vibrant Pink Stained Glass"], null), new r(null, 3, [S, 105, N, new K(null, 4, 5, L, [108, 19, 86, 128], null), R, "Dull Pink Stained Glass"], null), new r(null, 3, [S, 106, N, new K(null, 4, 5, L, [247, 171, 171, 200], null), R, "Red Tinted Glass"], null), new r(null, 3, [S, 107, N, new K(null, 4, 5, L, [247, 228, 171, 200], null), R, "Yellow Tinted Glass"], 
null), new r(null, 3, [S, 108, N, new K(null, 4, 5, L, [180, 247, 171, 200], null), R, "Green Tinted Glass"], null), new r(null, 3, [S, 109, N, new K(null, 4, 5, L, [171, 247, 247, 200], null), R, "Teal Tinted Glass"], null), new r(null, 3, [S, 110, N, new K(null, 4, 5, L, [171, 209, 247, 200], null), R, "Blue Tinted Glass"], null), new r(null, 3, [S, 111, N, new K(null, 4, 5, L, [209, 171, 247, 200], null), R, "Purple Tinted Glass"], null), new r(null, 3, [S, 112, N, new K(null, 4, 5, L, [247, 171, 
228, 200], null), R, "Pink Tinted Glass"], null), new r(null, 3, [S, 113, N, new K(null, 4, 5, L, [255, 255, 255, 0], null), R, "Unused"], null)]), Rm = kf(function(a) {
  var b = pd.i, c = N.h(a);
  var d = I(c, 0);
  var e = I(c, 1), f = I(c, 2);
  c = I(c, 3);
  d = ["rgba(", u.h(d), ",", u.h(e), ",", u.h(f), ",", u.h(c / 255.0), ")"].join("");
  return b.call(pd, a, bl, d);
}, Qm);
tg([Wh, fi, gi, ui, bj, jj, kj, zj, Ck, Dk], [kf(Rm, new K(null, 14, 5, L, [1, 2, 3, 4, 5, 6, 7, 64, 65, 66, 67, 68, 69, 70], null)), kf(Rm, new K(null, 7, 5, L, [106, 107, 108, 109, 110, 111, 112], null)), kf(Rm, new K(null, 14, 5, L, [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91], null)), kf(Rm, new K(null, 7, 5, L, [71, 72, 73, 74, 75, 76, 77], null)), kf(Rm, new K(null, 14, 5, L, [9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48], null)), kf(Rm, new K(null, 14, 5, L, [10, 13, 16, 
19, 22, 25, 28, 31, 34, 37, 40, 43, 46, 49], null)), kf(Rm, new K(null, 7, 5, L, [57, 58, 59, 60, 61, 62, 63], null)), kf(Rm, new K(null, 14, 5, L, [92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105], null)), kf(Rm, new K(null, 7, 5, L, [50, 51, 52, 53, 54, 55, 56], null)), kf(Rm, new K(null, 14, 5, L, [8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 41, 44, 47], null))]);
function Sm(a, b, c, d) {
  return new r(null, 4, [S, a, N, jd.g(c, Math.floor(255 * d)), R, ["MoonCat ", u.h(b)].join(""), bl, ["rgba(", u.h(c.h ? c.h(0) : c.call(null, 0)), ",", u.h(c.h ? c.h(1) : c.call(null, 1)), ",", u.h(c.h ? c.h(2) : c.call(null, 2)), ", ", u.h(d), ")"].join("")], null);
}
function Tm(a) {
  var b = Gl(a);
  I(b, 0);
  var c = I(b, 1), d = I(b, 2), e = I(b, 3), f = I(b, 4), g = I(b, 5), k = I(b, 6);
  b = I(b, 7);
  return new K(null, 14, 5, L, [pd.i(Sm(114, "Border (glows)", c, 1), Pk, ["rgb(", kl(",", yl(a)), ")"].join("")), Sm(115, "Pattern", d, 1), Sm(116, "Coat", e, 1), Sm(117, "Belly/Whiskers", f, 1), Sm(118, "Nose/Ears/Feet", g, 1), Sm(119, "Eyes", c, 1), Sm(120, "Complement 1", k, 1), Sm(121, "C1 Smoked Glass", k, 0.5), Sm(122, "C1 Stained Glass", k, 0.4), Sm(123, "C1 Tinted Glass", k, 0.3), Sm(124, "Complement 2", b, 1), Sm(125, "C2 Smoked Glass", b, 0.5), Sm(126, "C2 Stained Glass", b, 0.4), Sm(127, 
  "C2 Tinted Glass", b, 0.3)], null);
}
;function Um(a, b, c, d, e, f) {
  function g(x) {
    x = A(x);
    for (var D = null, P = 0, ea = 0;;) {
      if (ea < P) {
        var fa = D.M(null, ea);
        y.fillStyle = fa.h ? fa.h(2) : fa.call(null, 2);
        y.fillRect(e + d * (fa.h ? fa.h(0) : fa.call(null, 0)), e + d * (fa.h ? fa.h(1) : fa.call(null, 1)), d, d);
        ea += 1;
      } else {
        if (x = A(x)) {
          D = x, Dd(D) ? (x = ic(D), P = jc(D), D = x, fa = H(x), x = P, P = fa) : (fa = B(D), y.fillStyle = fa.h ? fa.h(2) : fa.call(null, 2), y.fillRect(e + d * (fa.h ? fa.h(0) : fa.call(null, 0)), e + d * (fa.h ? fa.h(1) : fa.call(null, 1)), d, d), x = C(D), D = null, P = 0), ea = 0;
        } else {
          return null;
        }
      }
    }
  }
  var k = De(c);
  c = w.g(k, Bh);
  var l = w.g(k, Wk), m = w.g(k, Yk), n = w.g(k, Wi), q = w.g(k, Hi);
  k = w.g(k, Ek);
  var v = document.createElement("canvas"), y = v.getContext("2d");
  v.width = a * d + 2 * e;
  v.height = b * d + 2 * e;
  t(f) && (y.fillStyle = f, y.fillRect(0, 0, v.width, v.height));
  y.save();
  y.shadowBlur = l;
  y.shadowColor = c;
  g(m);
  y.restore();
  g(n);
  y.save();
  y.shadowBlur = l;
  y.shadowColor = c;
  g(q);
  y.restore();
  g(k);
  return v.toDataURL();
}
;function Vm(a, b) {
  a = new K(null, 2, 5, L, [a, b], null);
  if (E.g(new K(null, 2, 5, L, [ki, $k], null), a)) {
    return new K(null, 2, 5, L, [-5.5, -7.5], null);
  }
  if (E.g(new K(null, 2, 5, L, [Mi, $k], null), a) || E.g(new K(null, 2, 5, L, [Zh, $k], null), a)) {
    return new K(null, 2, 5, L, [-6.5, -7.5], null);
  }
  if (E.g(new K(null, 2, 5, L, [ck, $k], null), a)) {
    return new K(null, 2, 5, L, [-5.5, -13.5], null);
  }
  if (E.g(new K(null, 2, 5, L, [ki, ek], null), a)) {
    return new K(null, 2, 5, L, [-15.5, -7.5], null);
  }
  if (E.g(new K(null, 2, 5, L, [Mi, ek], null), a)) {
    return new K(null, 2, 5, L, [-13.5, -7.5], null);
  }
  if (E.g(new K(null, 2, 5, L, [Zh, ek], null), a)) {
    return new K(null, 2, 5, L, [-10.5, -7.5], null);
  }
  if (E.g(new K(null, 2, 5, L, [ck, ek], null), a)) {
    return new K(null, 2, 5, L, [-14.5, -13.5], null);
  }
  throw Error(["No matching clause: ", u.h(a)].join(""));
}
function Wm(a) {
  a = nl(a);
  a = pl(a.substring(2, 4));
  var b = ql(a), c = E.g("0", b.substring(1, 2)) ? $k : ek, d = function() {
    var e = b.substring(6, 8);
    switch(e) {
      case "00":
        return ki;
      case "01":
        return Mi;
      case "10":
        return Zh;
      case "11":
        return ck;
      default:
        throw Error(["No matching clause: ", e].join(""));
    }
  }();
  return new r(null, 3, [Dh, a, Pi, c, Wj, d], null);
}
function Xm(a) {
  a = Wm(a);
  a = De(a);
  var b = w.g(a, Dh), c = w.g(a, Pi), d = w.g(a, Wj);
  a = function() {
    var g = Xd(b, 128);
    return xl.h ? xl.h(g) : xl.call(null, g);
  }();
  var e = De(a), f = w.g(e, O);
  a = w.g(e, W);
  e = w.g(e, T);
  e = Ff(Ze(function(g, k) {
    return 0 < k ? new K(null, 3, 5, L, [Zd(g, f), Yd(g, f), k], null) : null;
  }, e));
  d = Vm(d, c);
  c = I(d, 0);
  d = I(d, 1);
  return new r(null, 5, [O, f, W, a, Xh, c, Sk, d, Gk, e], null);
}
function Ym(a, b) {
  a = new K(null, 2, 5, L, [a, b], null);
  if (E.g(new K(null, 2, 5, L, [ki, $k], null), a)) {
    return new K(null, 2, 5, L, [0, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [Mi, $k], null), a) || E.g(new K(null, 2, 5, L, [Zh, $k], null), a)) {
    return new K(null, 2, 5, L, [1, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [ck, $k], null), a)) {
    return new K(null, 2, 5, L, [0, 6], null);
  }
  if (E.g(new K(null, 2, 5, L, [ki, ek], null), a)) {
    return new K(null, 2, 5, L, [10, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [Mi, ek], null), a)) {
    return new K(null, 2, 5, L, [8, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [Zh, ek], null), a)) {
    return new K(null, 2, 5, L, [5, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [ck, ek], null), a)) {
    return new K(null, 2, 5, L, [9, 6], null);
  }
  throw Error(["No matching clause: ", u.h(a)].join(""));
}
function Zm(a, b) {
  a = new K(null, 2, 5, L, [a, b], null);
  if (E.g(new K(null, 2, 5, L, [0, !1], null), a)) {
    return new K(null, 2, 5, L, [0, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [1, !1], null), a) || E.g(new K(null, 2, 5, L, [2, !1], null), a)) {
    return new K(null, 2, 5, L, [-2, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [3, !1], null), a)) {
    return new K(null, 2, 5, L, [0, -12], null);
  }
  if (E.g(new K(null, 2, 5, L, [0, !0], null), a)) {
    return new K(null, 2, 5, L, [-20, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [1, !0], null), a)) {
    return new K(null, 2, 5, L, [-16, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [2, !0], null), a)) {
    return new K(null, 2, 5, L, [-10, 0], null);
  }
  if (E.g(new K(null, 2, 5, L, [3, !0], null), a)) {
    return new K(null, 2, 5, L, [-18, -12], null);
  }
  throw Error(["No matching clause: ", u.h(a)].join(""));
}
var $m = Eg([new K(null, 2, 5, L, [10, 9], null), new K(null, 2, 5, L, [1, 10], null), new K(null, 2, 5, L, [0, 9], null), new K(null, 2, 5, L, [10, 10], null), new K(null, 2, 5, L, [0, 10], null), new K(null, 2, 5, L, [9, 10], null)]);
function an(a) {
  a = Wm(a);
  var b = De(a), c = w.g(b, Dh);
  a = w.g(b, Pi);
  b = w.g(b, Wj);
  var d = function() {
    var m = Xd(c, 128);
    return xl.h ? xl.h(m) : xl.call(null, m);
  }();
  d = De(d);
  var e = w.g(d, O);
  w.g(d, W);
  d = w.g(d, T);
  var f = Ff(Ze(function(m, n) {
    return 0 < n ? new K(null, 3, 5, L, [Zd(m, e), Yd(m, e), n], null) : null;
  }, d)), g = Vm(b, a);
  d = I(g, 0);
  g = I(g, 1);
  a = Ym(b, a);
  var k = I(a, 0), l = I(a, 1);
  a = Ff(ff(function(m) {
    var n = I(m, 0);
    m = I(m, 1);
    n = new K(null, 2, 5, L, [n, m], null);
    n = $m.h ? $m.h(n) : $m.call(null, n);
    return Ta(n);
  }, af.g(function(m) {
    var n = I(m, 0), q = I(m, 1);
    m = I(m, 2);
    return new K(null, 3, 5, L, [n - k, q - l, m], null);
  }, ff(function(m) {
    var n = I(m, 0);
    m = I(m, 1);
    return n >= k && n <= k + 10 && m >= l && m <= l + 10;
  }, f))));
  return new r(null, 5, [O, 11, W, 11, Xh, d, Sk, g, Gk, a], null);
}
;var bn = 20, cn = 0.8;
function dn(a, b, c) {
  if (t(b)) {
    a = t(c) ? an(a) : Xm(a);
    var d = De(a);
    a = w.g(d, O);
    b = w.g(d, W);
    c = w.g(d, Xh);
    var e = w.g(d, Sk);
    d = w.g(d, Gk);
    var f = Wd(64 + 2 * c), g = Wd(64 + 2 * e);
    c = ab(function(k, l) {
      var m = I(l, 0), n = I(l, 1);
      l = I(l, 2) + 114 + -1;
      m = 2 * m + f;
      n = 2 * n + g;
      return jd.m(k, new K(null, 3, 5, L, [m, n, l], null), gd([new K(null, 3, 5, L, [m + 1, n, l], null), new K(null, 3, 5, L, [m, n + 1, l], null), new K(null, 3, 5, L, [m + 1, n + 1, l], null)]));
    }, ld, d);
    return new r(null, 6, [oi, 0, $k, 0, ii, 128, ek, 128, Od, 0, Gk, c], null);
  }
  a = t(c) ? an(a) : Xm(a);
  d = De(a);
  a = w.g(d, O);
  b = w.g(d, W);
  c = w.g(d, Xh);
  e = w.g(d, Sk);
  d = w.g(d, Gk);
  f = Wd(64 + 2 * c);
  g = Wd(64 + 2 * e);
  c = ab(function(k, l) {
    var m = I(l, 0), n = I(l, 1);
    l = I(l, 2) + 114 + -1;
    m *= 2;
    n *= 2;
    return jd.m(k, new K(null, 3, 5, L, [m, n, l], null), gd([new K(null, 3, 5, L, [m + 1, n, l], null), new K(null, 3, 5, L, [m, n + 1, l], null), new K(null, 3, 5, L, [m + 1, n + 1, l], null)]));
  }, ld, d);
  return new r(null, 6, [oi, g, $k, f, ii, g + 2 * b, ek, f + 2 * a, Od, 0, Gk, c], null);
}
function Ve(a, b, c, d, e) {
  var f = De(e), g = w.g(f, Xk), k = w.g(f, Vh);
  e = w.g(f, O);
  var l = w.g(f, W), m = w.g(f, si), n = w.g(f, Ik), q = w.g(f, Od), v = De(f), y = w.g(v, Na), x = w.g(v, Oi);
  f = w.g(v, ti);
  v = w.g(v, Qj);
  y = Hd(y) ? ul(y) : null;
  x = null == x ? Oi.h(y) : x;
  f = null == f ? ti.h(y) : f;
  v = null == v ? Qj.h(y) : v;
  x = De(new r(null, 3, [Oi, x, ti, f, Qj, v], null));
  v = w.g(x, Oi);
  f = w.g(x, ti);
  x = w.g(x, Qj);
  y = g.h ? g.h(a) : g.call(null, a);
  g = I(y, 0);
  y = I(y, 1);
  var D = Zm(a, b);
  a = I(D, 0);
  D = I(D, 1);
  a = t(d) ? t(t(b) ? x : b) ? g - a : g + a : g;
  d = t(d) ? y + D : y;
  k = w.g(k, n);
  if (0 === q || 0 === e || 0 === l || null == q || null == e || null == l || 128 <= a || 128 <= d || null == k) {
    return null;
  }
  k = hf(new K(null, 1, 5, L, [null], null), k);
  q = t(v) ? -q : q;
  n = t(t(b) ? x : b) ? 128 - a - e : a;
  b = Kl(new r(null, 7, [O, e, W, l, Si, m, hk, k, yk, t(b) ? f : b, Mj, t(c) ? n : null, yi, t(c) ? d : null], null));
  return new r(null, 6, [oi, t(c) ? 0 : d, $k, t(c) ? 0 : n, ii, t(c) ? 128 : d + l, ek, t(c) ? 128 : n + e, Od, q, Gk, b], null);
}
function en(a) {
  var b = A(a);
  B(b);
  C(b);
  var c = a;
  b = a = ld;
  for (var d = 128, e = 0, f = 128, g = 0;;) {
    var k = A(c);
    c = B(k);
    k = C(k);
    var l = c;
    c = a;
    a = b;
    var m = d, n = e, q = f, v = g;
    if (null == l) {
      return new r(null, 6, [gj, c, qk, a, Li, m, mi, q, cj, n - m, Rh, v - q], null);
    }
    if (0 > Od.h(l)) {
      b = k;
      k = c;
      var y = jd.g(a, l);
      d = function() {
        var x = m, D = oi.h(l);
        return x < D ? x : D;
      }();
      e = function() {
        var x = n, D = ii.h(l);
        return x > D ? x : D;
      }();
      f = function() {
        var x = q, D = $k.h(l);
        return x < D ? x : D;
      }();
      g = function() {
        var x = v, D = ek.h(l);
        return x > D ? x : D;
      }();
      c = b;
      a = k;
      b = y;
    } else {
      b = k, k = jd.g(c, l), y = a, d = function() {
        var x = m, D = oi.h(l);
        return x < D ? x : D;
      }(), e = function() {
        var x = n, D = ii.h(l);
        return x > D ? x : D;
      }(), f = function() {
        var x = q, D = $k.h(l);
        return x < D ? x : D;
      }(), g = function() {
        var x = v, D = ek.h(l);
        return x > D ? x : D;
      }(), c = b, a = k, b = y;
    }
  }
}
function Te(a, b, c, d, e) {
  var f = I(d, 0), g = I(d, 1), k = De(e);
  e = w.g(k, oi);
  d = w.g(k, $k);
  k = w.g(k, Gk);
  for (var l = H(k), m = 0;;) {
    if (m === l) {
      return new K(null, 2, 5, L, [f, g], null);
    }
    var n = k.h ? k.h(m) : k.call(null, m), q = I(n, 0), v = I(n, 1);
    n = I(n, 2);
    q = new K(null, 3, 5, L, [q + d - b, v + e - a, c.h ? c.h(n) : c.call(null, n)], null);
    114 === n ? (m += 1, f = jd.g(f, q), g = jd.g(g, q)) : (m += 1, g = jd.g(g, q));
  }
}
function fn(a, b, c) {
  var d = Nd(gf(Qa, b));
  b = yl(a);
  b = ["rgba(", kl(",", b), ",", u.h(cn), ")"].join("");
  d = en(d);
  var e = De(d), f = w.g(e, gj), g = w.g(e, qk), k = w.g(e, Li), l = w.g(e, mi);
  d = w.g(e, Rh);
  e = w.g(e, cj);
  a = kf(bl, hf(Rm, Tm(a)));
  k = Se(k, l, a);
  g = ab(k, new K(null, 2, 5, L, [Dg, ld], null), g);
  a = I(g, 0);
  g = I(g, 1);
  k = ab(k, new K(null, 2, 5, L, [Dg, ld], null), f);
  f = I(k, 0);
  k = I(k, 1);
  return 0 >= e || 0 >= d ? new r(null, 3, [O, 0, W, 0, dl, null], null) : new r(null, 3, [O, d, W, e, dl, new r(null, 6, [Bh, b, Wk, bn, Yk, t(c) ? a : null, Wi, g, Hi, t(c) ? f : null, Ek, k], null)], null);
}
function gn(a) {
  a = De(a);
  var b = w.g(a, si), c = w.g(a, Si), d = w.g(a, Di), e = w.g(a, Vh), f = w.g(a, Ik);
  if (t(e)) {
    d = e;
  } else {
    if (t(d)) {
      d = new K(null, 1, 5, L, [Ff(Hc(d))], null);
    } else {
      throw new rh("no palettes", Ge);
    }
  }
  return pd.m(a, Vh, d, gd([si, t(b) ? b : c, Ik, t(f) ? f : 0]));
}
function hn(a, b, c, d, e, f) {
  var g = Wm(a), k = E.g(Pi.h(g), ek), l = function() {
    var m = Wj.h(g);
    m = m instanceof z ? m.ta : null;
    switch(m) {
      case "standing":
        return 0;
      case "sleeping":
        return 1;
      case "pouncing":
        return 2;
      case "stalking":
        return 3;
      default:
        throw Error(["No matching clause: ", u.h(m)].join(""));
    }
  }();
  b = af.g(gn, b);
  k = af.g(Ue(l, k, e, gd([f])), b);
  c = t(c) ? dn(a, e, f) : null;
  return fn(a, jd.g(k, c), d);
}
function jn(a, b, c) {
  var d = De(c), e = w.i(d, ni, 5);
  c = w.g(d, Jj);
  var f = w.g(d, Ji), g = w.g(d, ej), k = w.g(d, Pj), l = w.i(d, Pk, !0);
  d = w.g(d, yj);
  a = hn(a, b, Ta(k), l, g, d);
  g = De(a);
  a = w.g(g, O);
  b = w.g(g, W);
  g = w.g(g, dl);
  e = t(e) ? e : 1;
  return Um(a, b, g, e, t(c) ? c : 3 * e, f);
}
function kn(a, b, c) {
  var d = De(c), e = w.i(d, ni, 5), f = w.g(d, Jj);
  c = w.g(d, Ji);
  var g = w.g(d, ej), k = w.g(d, Pj), l = w.i(d, Pk, !0);
  d = w.g(d, yj);
  a = hn(a, b, Ta(k), l, g, d);
  g = De(a);
  a = w.g(g, O);
  b = w.g(g, W);
  g = w.g(g, dl);
  e = t(e) ? e : 1;
  f = t(f) ? f : 3 * e;
  c = Um(a, b, g, e, f, c);
  return new r(null, 3, [Tk, c, O, a * e + 2 * f, W, b * e + 2 * f], null);
}
;function ln(a, b, c, d, e, f, g, k, l, m, n, q, v, y, x, D, P) {
  this.id = a;
  this.qa = b;
  this.ra = c;
  this.ma = d;
  this.oa = e;
  this.facing = f;
  this.ka = g;
  this.pattern = k;
  this.pa = l;
  this.r = m;
  this.la = n;
  this.b = q;
  this.na = v;
  this.color = y;
  this.ya = x;
  this.W = D;
  this.A = P;
  this.o = 2230716170;
  this.G = 139264;
}
h = ln.prototype;
h.T = function(a, b) {
  return this.H(null, b, null);
};
h.H = function(a, b, c) {
  switch(b instanceof z ? b.ta : null) {
    case "id":
      return this.id;
    case "rescue-order":
      return this.qa;
    case "vintage":
      return this.ra;
    case "genesis":
      return this.ma;
    case "pale":
      return this.oa;
    case "facing":
      return this.facing;
    case "expression":
      return this.ka;
    case "pattern":
      return this.pattern;
    case "pose":
      return this.pa;
    case "r":
      return this.r;
    case "g":
      return this.la;
    case "b":
      return this.b;
    case "hue":
      return this.na;
    case "color":
      return this.color;
    default:
      return w.i(this.W, b, c);
  }
};
h.pb = function(a, b, c) {
  return ab(function(d, e) {
    var f = I(e, 0);
    e = I(e, 1);
    return b.i ? b.i(d, f, e) : b.call(null, d, f, e);
  }, c, this);
};
h.O = function(a, b, c) {
  return Og(b, function(d) {
    return Og(b, Wg, "", " ", "", c, d);
  }, "#libmooncat.filter.MoonCatFilterable{", ", ", "}", c, te.g(new K(null, 14, 5, L, [new K(null, 2, 5, L, [S, this.id], null), new K(null, 2, 5, L, [Oh, this.qa], null), new K(null, 2, 5, L, [uk, this.ra], null), new K(null, 2, 5, L, [sk, this.ma], null), new K(null, 2, 5, L, [kj, this.oa], null), new K(null, 2, 5, L, [Pi, this.facing], null), new K(null, 2, 5, L, [Uh, this.ka], null), new K(null, 2, 5, L, [al, this.pattern], null), new K(null, 2, 5, L, [Wj, this.pa], null), new K(null, 2, 5, 
  L, [Ph, this.r], null), new K(null, 2, 5, L, [mj, this.la], null), new K(null, 2, 5, L, [Vj, this.b], null), new K(null, 2, 5, L, [yh, this.na], null), new K(null, 2, 5, L, [bi, this.color], null)], null), this.W));
};
h.za = function() {
  return new Qf(this, new K(null, 14, 5, L, [S, Oh, uk, sk, kj, Pi, Uh, al, Wj, Ph, mj, Vj, yh, bi], null), t(this.W) ? oc(this.W) : Fe());
};
h.U = function() {
  return this.ya;
};
h.N = function() {
  return 14 + H(this.W);
};
h.S = function() {
  var a = this.A;
  return null != a ? a : this.A = a = -2053029138 ^ Pc(this);
};
h.D = function(a, b) {
  return null != b && this.constructor === b.constructor && E.g(this.id, b.id) && E.g(this.qa, b.qa) && E.g(this.ra, b.ra) && E.g(this.ma, b.ma) && E.g(this.oa, b.oa) && E.g(this.facing, b.facing) && E.g(this.ka, b.ka) && E.g(this.pattern, b.pattern) && E.g(this.pa, b.pa) && E.g(this.r, b.r) && E.g(this.la, b.la) && E.g(this.b, b.b) && E.g(this.na, b.na) && E.g(this.color, b.color) && E.g(this.W, b.W);
};
h.ab = function(a, b) {
  switch(b instanceof z ? b.ta : null) {
    case "id":
    case "rescue-order":
    case "vintage":
    case "genesis":
    case "pale":
    case "facing":
    case "expression":
    case "pattern":
    case "pose":
    case "r":
    case "g":
    case "b":
    case "hue":
    case "color":
      return !0;
    default:
      return Id(this.W, b);
  }
};
h.Ba = function(a, b, c) {
  return t(ge.g ? ge.g(S, b) : ge.call(null, S, b)) ? new ln(c, this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(Oh, b) : ge.call(null, Oh, b)) ? new ln(this.id, c, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(uk, b) : ge.call(null, uk, b)) ? new ln(this.id, this.qa, c, this.ma, 
  this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(sk, b) : ge.call(null, sk, b)) ? new ln(this.id, this.qa, this.ra, c, this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(kj, b) : ge.call(null, kj, b)) ? new ln(this.id, this.qa, this.ra, this.ma, c, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, this.b, this.na, 
  this.color, this.ya, this.W, null) : t(ge.g ? ge.g(Pi, b) : ge.call(null, Pi, b)) ? new ln(this.id, this.qa, this.ra, this.ma, this.oa, c, this.ka, this.pattern, this.pa, this.r, this.la, this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(Uh, b) : ge.call(null, Uh, b)) ? new ln(this.id, this.qa, this.ra, this.ma, this.oa, this.facing, c, this.pattern, this.pa, this.r, this.la, this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(al, b) : ge.call(null, al, b)) ? new ln(this.id, 
  this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, c, this.pa, this.r, this.la, this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(Wj, b) : ge.call(null, Wj, b)) ? new ln(this.id, this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, c, this.r, this.la, this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(Ph, b) : ge.call(null, Ph, b)) ? new ln(this.id, this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, this.pa, c, this.la, 
  this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(mj, b) : ge.call(null, mj, b)) ? new ln(this.id, this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, c, this.b, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(Vj, b) : ge.call(null, Vj, b)) ? new ln(this.id, this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, c, this.na, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(yh, b) : ge.call(null, 
  yh, b)) ? new ln(this.id, this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, this.b, c, this.color, this.ya, this.W, null) : t(ge.g ? ge.g(bi, b) : ge.call(null, bi, b)) ? new ln(this.id, this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, this.b, this.na, c, this.ya, this.W, null) : new ln(this.id, this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, this.b, 
  this.na, this.color, this.ya, pd.i(this.W, b, c), null);
};
h.P = function() {
  return A(te.g(new K(null, 14, 5, L, [new Cf(S, this.id), new Cf(Oh, this.qa), new Cf(uk, this.ra), new Cf(sk, this.ma), new Cf(kj, this.oa), new Cf(Pi, this.facing), new Cf(Uh, this.ka), new Cf(al, this.pattern), new Cf(Wj, this.pa), new Cf(Ph, this.r), new Cf(mj, this.la), new Cf(Vj, this.b), new Cf(yh, this.na), new Cf(bi, this.color)], null), this.W));
};
h.V = function(a, b) {
  return new ln(this.id, this.qa, this.ra, this.ma, this.oa, this.facing, this.ka, this.pattern, this.pa, this.r, this.la, this.b, this.na, this.color, b, this.W, this.A);
};
h.Y = function(a, b) {
  return Cd(b) ? this.Ba(null, kb.g(b, 0), kb.g(b, 1)) : ab(ib, this, b);
};
var mn = Ff(function(a, b) {
  return function f(d, e) {
    return new ke(null, function() {
      var g = A(e);
      if (g) {
        if (Dd(g)) {
          for (var k = ic(g), l = H(k), m = new me(Array(l)), n = 0;;) {
            if (n < l) {
              qe(m, function() {
                var q = d + n, v = kb.g(k, n);
                return a.g ? a.g(q, v) : a.call(null, q, v);
              }()), n += 1;
            } else {
              break;
            }
          }
          return pe(m.X(), f(d + l, jc(g)));
        }
        return fd(function() {
          var q = B(g);
          return a.g ? a.g(d, q) : a.call(null, d, q);
        }(), f(d + 1, Hc(g)));
      }
      return null;
    }, null);
  }(0, b);
}(function(a, b) {
  var c = Ll(b), d = De(c);
  c = w.g(d, Pk);
  var e = w.g(d, sk), f = w.g(d, kj), g = w.g(d, cl);
  d = w.g(d, Dh);
  d = ql(d);
  return new ln(b, a, Ml(a), e, f, parseInt(d.substring(1, 2), 2), parseInt(d.substring(2, 4), 2), parseInt(d.substring(4, 6), 2), parseInt(d.substring(6, 8), 2), c.h ? c.h(0) : c.call(null, 0), c.h ? c.h(1) : c.call(null, 1), c.h ? c.h(2) : c.call(null, 2), g, Bl(g), null, null, null);
}, vl));
function nn(a, b) {
  return !0 === b || !1 === b ? function(c) {
    return E.g(a.h ? a.h(c) : a.call(null, c), b);
  } : null;
}
function on(a) {
  if (null == a) {
    return null;
  }
  if (rd(a)) {
    return function(c) {
      c = Oh.h ? Oh.h(c) : Oh.call(null, c);
      return a.h ? a.h(c) : a.call(null, c);
    };
  }
  if (Hd(a)) {
    return function(c) {
      return E.g(Oh.h ? Oh.h(c) : Oh.call(null, c), a);
    };
  }
  if (xd(a) && !wd(a)) {
    var b = Fg(a);
    return function(c) {
      return Id(b, Oh.h ? Oh.h(c) : Oh.call(null, c));
    };
  }
  return null;
}
function pn(a, b, c) {
  var d = Fg(gf(Qa, xd(c) ? af.g(a, c) : new K(null, 1, 5, L, [a.h ? a.h(c) : a.call(null, c)], null)));
  return wd(d) ? null : function(e) {
    return Id(d, b.h ? b.h(e) : b.call(null, e));
  };
}
var qn = new r(null, 5, [2017, 2017, 2018, 2018, 2019, 2019, 2020, 2020, 2021, 2021], null), rn = new r(null, 6, [$k, 0, ek, 1, "left", 0, "right", 1, 0, 0, 1, 1], null), sn = tg([0, "pouting", 1, "grumpy", Gi, "shy", "smiling", 3, 2, jk, Nk, Ok], [0, 2, 1, 1, 1, 3, 0, 3, 2, 2, 0, 3]), tn = tg([0, wh, 1, "tortie", "tabby", "pure", 3, 2, "spotted", Tj, Zj, zk], [0, 3, 1, 3, 1, 0, 3, 2, 2, 2, 1, 0]), un = tg([0, 1, Zh, ki, Mi, "standing", "stalking", "pouncing", 3, 2, ck, "sleeping"], [0, 1, 2, 0, 
1, 0, 3, 2, 3, 2, 3, 1]);
function vn(a) {
  var b = De(a), c = w.g(b, sk), d = w.g(b, uk), e = w.g(b, al), f = w.g(b, yh), g = w.g(b, Uh);
  a = w.g(b, bi);
  var k = w.g(b, Pi), l = w.g(b, kj), m = w.g(b, S), n = w.g(b, Wj), q = w.g(b, lk);
  b = rd(m) ? function(x) {
    x = S.h(x);
    return m.h ? m.h(x) : m.call(null, x);
  } : "string" === typeof m ? function(x) {
    return E.g(S.h(x), m);
  } : xd(m) ? function(x) {
    return Id(m, x);
  } : null;
  var v = rd(f) ? function(x) {
    x = yh.h(x);
    return f.h ? f.h(x) : f.call(null, x);
  } : null;
  q = on(q);
  d = pn(qn, uk, d);
  c = nn(sk, c);
  l = nn(kj, l);
  k = pn(rn, Pi, k);
  g = pn(sn, Uh, g);
  e = pn(tn, al, e);
  n = pn(un, Wj, n);
  var y = Fg(gf(Qa, af.g(ie, null == a ? null : xd(a) ? a : t(a) ? new K(null, 1, 5, L, [a], null) : null)));
  a = wd(y) ? null : function(x) {
    return Id(y, bi.h(x));
  };
  a = gf(Qa, new K(null, 11, 5, L, [b, v, q, d, c, l, k, g, e, n, a], null));
  return wd(a) ? Oe() : Be($e, a);
}
function wn(a, b) {
  var c = vn(b);
  return ab(function(d, e) {
    return t(c.h ? c.h(e) : c.call(null, e)) ? ue.g(d, Oh.h(e)) : d;
  }, a, mn);
}
;function xn(a, b) {
  if (null != a && null != a.ac) {
    a = a.ac(a, b);
  } else {
    var c = xn[ba(null == a ? null : a)];
    if (null != c) {
      a = c.g ? c.g(a, b) : c.call(null, a, b);
    } else {
      if (c = xn._, null != c) {
        a = c.g ? c.g(a, b) : c.call(null, a, b);
      } else {
        throw Wa("BitSet.set-index!", a);
      }
    }
  }
  return a;
}
function yn(a) {
  if (null != a && null != a.bc) {
    a = a.bc(a);
  } else {
    var b = yn[ba(null == a ? null : a)];
    if (null != b) {
      a = b.h ? b.h(a) : b.call(null, a);
    } else {
      if (b = yn._, null != b) {
        a = b.h ? b.h(a) : b.call(null, a);
      } else {
        throw Wa("BitSet.to-solidity", a);
      }
    }
  }
  return a;
}
function zn(a) {
  this.data = a;
}
zn.prototype.ac = function(a, b) {
  a = Yd(b, 8);
  this.data[a] = this.data[a] | 1 << 7 - Zd(b, 8) | 0;
  return this;
};
zn.prototype.bc = function() {
  return Ff(af.g(function(a) {
    return ["0x", jl(a)].join("");
  }, mf(32, ab(function(a, b) {
    return jd.g(a, ol(b));
  }, ld, this.data))));
};
function An(a) {
  return ab(function(b, c) {
    return xn(b, c);
  }, new zn(new Uint8Array(3200)), a);
}
function Bn(a, b) {
  var c = Zd(b, 256), d = Yd(c, 4);
  c = 3 - Zd(c, 4);
  a = ad(a, Yd(b, 256));
  d = be(nl(a), d, d + 1);
  return 0 != (pl(d) & 1 << c);
}
function Cn(a, b) {
  var c = Yd(25599, 256), d = Zd(25599, 256), e = Yd(d, 4);
  d = 3 - Zd(d, 4);
  var f = ad(a, c);
  f = nl(f);
  var g = pl(f.substring(e, e + 1));
  b = (t(b) ? g | 1 << d : g & ~(1 << d)).toString(16);
  e = ["0x", f.substring(0, e), u.h(b), f.substring(e + 1)].join("");
  return pd.i(a, c, e);
}
;function Dn(a) {
  for (;;) {
    if (Hd(a)) {
      return 25440 > a && 0 <= a ? vl.h ? vl.h(a) : vl.call(null, a) : new r(null, 2, [hj, Yi, nj, "rescue order out of bounds"], null);
    }
    if ("string" === typeof a) {
      if (t(Lg(/^[0-9]+$/, a))) {
        a = parseInt(u.h(a), 10);
      } else {
        return a = a.toLowerCase(), a = sa(a, "0x") ? a : ["0x", u.h(a)].join(""), t(Lg(/0xff[0-9a-f]{2}000ca7$|0x00[0-9a-f]{8}$/, a)) ? a : new r(null, 2, [hj, Yi, nj, "malformed cat-id"], null);
      }
    } else {
      return new r(null, 2, [hj, Yi, nj, "unrecognized input"], null);
    }
  }
}
function En(a, b) {
  var c = Dn(b), d = wl.h ? wl.h(c) : wl.call(null, c), e = t(function() {
    var f = "string" === typeof c;
    return f ? d : f;
  }()) ? Em(a, c) : null;
  return new Promise(function(f, g) {
    return t(e) ? f.h ? f.h(e) : f.call(null, e) : g.h ? g.h(null) : g.call(null, null);
  });
}
function Fn(a, b) {
  var c = Dn(b), d = wl.h ? wl.h(c) : wl.call(null, c);
  return t(function() {
    var e = "string" === typeof c;
    return e ? d : e;
  }()) ? Fm(a, c) : new Promise(function(e) {
    return e.h ? e.h(!1) : e.call(null, !1);
  });
}
function Gn(a) {
  return vl.h ? vl.h(a) : vl.call(null, a);
}
function Hn(a, b, c) {
  var d = bn, e = cn, f = function() {
    var k = Wk.h(c);
    return t(k) ? k : 20;
  }(), g = function() {
    var k = $h.h(c);
    return t(k) ? k : 0.8;
  }();
  bn = f;
  cn = g;
  try {
    return jn(a, b, c);
  } finally {
    cn = e, bn = d;
  }
}
function In(a, b, c) {
  var d = bn, e = cn, f = function() {
    var k = Wk.h(c);
    return t(k) ? k : 20;
  }(), g = function() {
    var k = $h.h(c);
    return t(k) ? k : 0.8;
  }();
  bn = f;
  cn = g;
  try {
    return kn(a, b, c);
  } finally {
    cn = e, bn = d;
  }
}
var Jn = function Jn(a) {
  for (var c = [], d = arguments.length, e = 0;;) {
    if (e < d) {
      c.push(arguments[e]), e += 1;
    } else {
      break;
    }
  }
  return Jn.m(0 < c.length ? new Fc(c.slice(0), 0, null) : null);
};
Jn.m = function(a) {
  return Md(Jd, cc(ab(wn, ac(Dg), a)));
};
Jn.C = 0;
Jn.B = function(a) {
  return this.m(A(a));
};
la("libmooncat.core.print_all_hues", function() {
  return bh.m(gd([kl("\n", af.g(Al, vl))]));
});
la("libmooncat.core.print_all_palettes", function() {
  return bh.m(gd([kl("\n", af.g(Hl, vl))]));
});
la("libmooncat.core.print_all_palette_keys", function() {
  return bh.m(gd([kl("\n", af.g(function(a) {
    return ['"', u.h(a), '"'].join("");
  }, af.g(Jl, vl)))]));
});
function Kn(a) {
  a = Dn(a);
  return "string" === typeof a ? a : null;
}
la("libmooncat.jslib.parseCatId", Kn);
function Ln(a) {
  return Gn(a);
}
la("libmooncat.jslib.getCatId", Ln);
function Mn(a) {
  return wl.h ? wl.h(a) : wl.call(null, a);
}
la("libmooncat.jslib.getRescueOrder", Mn);
function Nn(a, b) {
  var c = kh.m;
  b = Dn(b);
  a = "string" === typeof b ? t(E.g ? E.g(mk, a) : E.call(null, mk, a)) ? Ll(b) : t(E.g ? E.g(qi, a) : E.call(null, qi, a)) ? Ol(b) : t(E.g ? E.g(kk, a) : E.call(null, kk, a)) ? Ul(b) : t(E.g ? E.g("basic", a) : E.call(null, "basic", a)) ? Ll(b) : t(E.g ? E.g("extended", a) : E.call(null, "extended", a)) ? Ol(b) : t(E.g ? E.g("erc721", a) : E.call(null, "erc721", a)) ? Ul(b) : t(E.g ? E.g("ERC721", a) : E.call(null, "ERC721", a)) ? Ul(b) : new r(null, 2, [hj, Yi, nj, "unrecognized result type"], 
  null) : b;
  return c.call(kh, a, gd([lh, tl]));
}
la("libmooncat.jslib.getTraits", Nn);
function On(a, b, c) {
  return Id(a, b) ? a : Id(a, c) ? pd.i(a, b, w.g(a, c)) : a;
}
function Pn(a) {
  return On(On(On(On(On(On(On(On(On(On(a, Od, bk), Ik, fk), Ji, Hk), ej, Bi), Pj, Nh), Qj, Vi), ti, Yh), yj, Sj), Wk, tk), $h, Sh);
}
function Qn(a) {
  a = ul(a);
  return kh.m(a, gd([lh, tl]));
}
la("libmooncat.jslib.parseAccessoryMeta", Qn);
var Rn = function Rn(a) {
  switch(arguments.length) {
    case 1:
      return Rn.h(arguments[0]);
    case 2:
      return Rn.g(arguments[0], arguments[1]);
    case 3:
      return Rn.i(arguments[0], arguments[1], arguments[2]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
la("libmooncat.jslib.generateImage", Rn);
Rn.h = function(a) {
  return Rn.i(a, null, null);
};
Rn.g = function(a, b) {
  return Rn.i(a, b, null);
};
Rn.i = function(a, b, c) {
  b = af.g(Pn, ph(b, gd([qh, !0])));
  c = Pn(ph(c, gd([qh, !0])));
  return Hn(a, b, c);
};
Rn.C = 3;
var Sn = function Sn(a) {
  switch(arguments.length) {
    case 1:
      return Sn.h(arguments[0]);
    case 2:
      return Sn.g(arguments[0], arguments[1]);
    case 3:
      return Sn.i(arguments[0], arguments[1], arguments[2]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
la("libmooncat.jslib.generateImageWithDimensions", Sn);
Sn.h = function(a) {
  return Sn.i(a, null, null);
};
Sn.g = function(a, b) {
  return Sn.i(a, b, null);
};
Sn.i = function(a, b, c) {
  b = af.g(Pn, ph(b, gd([qh, !0])));
  c = Pn(ph(c, gd([qh, !0])));
  return kh(In(a, b, c));
};
Sn.C = 3;
var Tn = function Tn(a) {
  switch(arguments.length) {
    case 0:
      return Tn.F();
    case 1:
      return Tn.h(arguments[0]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
la("libmooncat.jslib.fullPalette", Tn);
Tn.F = function() {
  return Tn.h("0xff00000ca7");
};
Tn.h = function(a) {
  return kh(hf(Rm, Tm(a)));
};
Tn.C = 1;
function Un(a, b, c) {
  var d = je(b);
  d = a.h ? a.h(d) : a.call(null, d);
  return t(d) ? pd.i(a, b, ie.h(d)) : pd.i(a, b, c);
}
function Vn(a) {
  a = oh(a);
  var b = pd.i;
  if ("number" === typeof(a.h ? a.h("hue") : a.call(null, "hue"))) {
    var c = a.h ? a.h("hue") : a.call(null, "hue");
  } else {
    c = a.h ? a.h("hue") : a.call(null, "hue"), c = t(E.g ? E.g("red", c) : E.call(null, "red", c)) ? 0 : t(E.g ? E.g("orange", c) : E.call(null, "orange", c)) ? 30 : t(E.g ? E.g("yellow", c) : E.call(null, "yellow", c)) ? 60 : t(E.g ? E.g("chartreuse", c) : E.call(null, "chartreuse", c)) ? 90 : t(E.g ? E.g("green", c) : E.call(null, "green", c)) ? 120 : t(E.g ? E.g("teal", c) : E.call(null, "teal", c)) ? 150 : t(E.g ? E.g("cyan", c) : E.call(null, "cyan", c)) ? 180 : t(E.g ? E.g("sky-blue", c) : 
    E.call(null, "sky-blue", c)) ? 210 : t(E.g ? E.g("blue", c) : E.call(null, "blue", c)) ? 240 : t(E.g ? E.g("purple", c) : E.call(null, "purple", c)) ? 270 : t(E.g ? E.g("magenta", c) : E.call(null, "magenta", c)) ? 300 : t(E.g ? E.g("fuchsia", c) : E.call(null, "fuchsia", c)) ? 330 : t(E.g ? E.g("black", c) : E.call(null, "black", c)) ? -1 : t(E.g ? E.g("white", c) : E.call(null, "white", c)) ? -2 : -1;
  }
  a = b.call(pd, a, yh, c);
  b = a.h ? a.h("pale") : a.call(null, "pale");
  b = t(b) ? b : a.h ? a.h("isPale") : a.call(null, "isPale");
  a = t(b) ? pd.i(a, kj, !0) : a;
  a = Un(Un(Un(Un(a, Uh, Nk), al, zk), Wj, ki), Pi, $k);
  return Vl(a);
}
la("libmooncat.jslib.generateMoonCatId", Vn);
var Wn = function Wn(a) {
  switch(arguments.length) {
    case 0:
      return Wn.F();
    case 1:
      return Wn.h(arguments[0]);
    default:
      throw Error(["Invalid arity: ", u.h(arguments.length)].join(""));
  }
};
la("libmooncat.jslib.randomMoonCatId", Wn);
Wn.F = function() {
  return Vl(new r(null, 6, [yh, bm(Wl), Uh, bm(Xl), al, bm(Yl), Wj, bm(Zl), Pi, bm($l), kj, bm(am)], null));
};
Wn.h = function(a) {
  a = Sd(function(b, c, d) {
    return Cd(d) ? pd.i(b, ie.h(c), kf(function(e) {
      return "string" === typeof e ? ie.h(e) : e;
    }, d)) : b;
  }, Ge, oh(a));
  return cm(a);
};
Wn.C = 1;
function Xn(a) {
  return Hd(a) && 0 <= a && 25439 >= a ? Gn(a) : null;
}
la("libmooncat.jslib.getMoonCatIdByRescueOrder", Xn);
function Yn(a) {
  return kh(yn(An(oh(a))));
}
la("libmooncat.jslib.rescueOrdersToEligibleList", Yn);
function Zn(a) {
  a = oh(a);
  var b = af.g(pl, Ng(/.{2}/, jl(af.g(nl, a))));
  b = Uint8Array.from(b);
  b = new zn(b);
  var c = cc;
  a: {
    for (var d = b.data.length, e = 0, f = ac(ld);;) {
      if (e < d) {
        var g = e + 1;
        var k = b.data[e];
        0 === k ? k = f : (f = 0 != (k & 128) ? ue.g(f, 8 * e) : f, f = 0 != (k & 64) ? ue.g(f, 1 + 8 * e) : f, f = 0 != (k & 32) ? ue.g(f, 2 + 8 * e) : f, f = 0 != (k & 16) ? ue.g(f, 3 + 8 * e) : f, f = 0 != (k & 8) ? ue.g(f, 4 + 8 * e) : f, f = 0 != (k & 4) ? ue.g(f, 5 + 8 * e) : f, f = 0 != (k & 2) ? ue.g(f, 6 + 8 * e) : f, k = 0 != (k & 1) ? ue.g(f, 7 + 8 * e) : f);
        e = g;
        f = k;
      } else {
        break a;
      }
    }
  }
  b = c(f);
  a = Bn(a, 25599) ? Jf(b, 0, H(b) - 1) : b;
  return kh(a);
}
la("libmooncat.jslib.eligibleListToRescueOrders", Zn);
function $n(a) {
  a = oh(a);
  a = t(a) ? Bn(a, 25599) : null;
  return kh(a);
}
la("libmooncat.jslib.isEligibleListActive", $n);
function ao(a) {
  return kh(Cn(oh(a), !0));
}
la("libmooncat.jslib.activateEligibleList", ao);
function bo(a) {
  return kh(Cn(oh(a), !1));
}
la("libmooncat.jslib.deactivateEligibleList", bo);
function co(a, b) {
  return t(t(a) ? Bn(a, 25599) : null) ? Bn(a, b) : !0;
}
la("libmooncat.jslib.isEligible", co);
var eo = function eo(a) {
  for (var c = [], d = arguments.length, e = 0;;) {
    if (e < d) {
      c.push(arguments[e]), e += 1;
    } else {
      break;
    }
  }
  return eo.m(0 < c.length ? new Fc(c.slice(0), 0, null) : null);
};
la("libmooncat.jslib.filterRescueOrders", eo);
eo.m = function(a) {
  return kh(Be(Jn, af.g(function(b) {
    return ph(b, gd([qh, !0]));
  }, a)));
};
eo.C = 0;
eo.B = function(a) {
  return this.m(A(a));
};
function fo(a, b) {
  return new Promise(function(c, d) {
    return En(a, b).then(function(e) {
      e = kh.m(e, gd([lh, tl]));
      return c.h ? c.h(e) : c.call(null, e);
    }).catch(function(e) {
      return d.h ? d.h(e) : d.call(null, e);
    });
  });
}
la("libmooncat.jslib.getContractDetails", fo);
function go(a, b) {
  return Fn(a, b);
}
la("libmooncat.jslib.isAcclimated", go);
function ho(a) {
  return Gm(a);
}
la("libmooncat.jslib.getTotalAccessories", ho);
function io(a, b) {
  return new Promise(function(c, d) {
    return Km(a, b).then(function(e) {
      e = kh.m(e, gd([lh, tl]));
      return c.h ? c.h(e) : c.call(null, e);
    }).catch(function(e) {
      return d.h ? d.h(e) : d.call(null, e);
    });
  });
}
la("libmooncat.jslib.getAccessory", io);
function jo(a, b) {
  return Lm(a, b);
}
la("libmooncat.jslib.getTotalManagedAccessories", jo);
function ko(a, b, c) {
  return Mm(a, b, c);
}
la("libmooncat.jslib.getManagedAccessoryIdByIndex", ko);
function lo(a, b) {
  return Nm(a, b);
}
la("libmooncat.jslib.getTotalMoonCatAccessories", lo);
function mo(a, b, c) {
  return new Promise(function(d, e) {
    return Om(a, b, c).then(function(f) {
      f = kh.m(f, gd([lh, tl]));
      return d.h ? d.h(f) : d.call(null, f);
    }).catch(function(f) {
      return e.h ? e.h(f) : e.call(null, f);
    });
  });
}
la("libmooncat.jslib.getMoonCatAccessory", mo);
function no(a, b, c) {
  return new Promise(function(d, e) {
    return Pm(a, b, c).then(function(f) {
      f = kh.m(f, gd([lh, tl]));
      return d.h ? d.h(f) : d.call(null, f);
    }).catch(function(f) {
      return e.h ? e.h(f) : e.call(null, f);
    });
  });
}
la("libmooncat.jslib.getDrawableMoonCatAccessory", no);
function oo(a) {
  a = Ge.h ? Ge.h(a) : Ge.call(null, a);
  a = t(a) ? new r(null, 4, [Fj, a.h ? a.h(0) : a.call(null, 0), aj, a.h ? a.h(1) : a.call(null, 1), bi, a.h ? a.h(2) : a.call(null, 2), zi, a.h ? a.h(3) : a.call(null, 3)], null) : null;
  return kh(a);
}
la("libmooncat.jslib.getLootprint", oo);
var po = {parseAccessoryMeta:Qn, getTotalAccessories:ho, isAcclimated:go, getMoonCatIdByRescueIndex:Xn, eligibleListToRescueOrders:Zn, getContractDetails:fo, getMoonCatAccessory:mo, limited:!0, getRescueOrder:Mn, getDrawableMoonCatAccessory:no, getCatId:Ln, filterRescueOrders:eo, println:ch, isEligible:co, getManagedAccessoryIdByIndex:ko, parseCatId:Kn, getTraits:Nn, rescueOrdersToEligibleList:Yn, fullPalette:Tn, contracts:Cm, generateImage:Rn, version:"1.1.4", generateImageWithDimensions:Sn, getTotalMoonCatAccessories:lo, 
deactivateEligibleList:bo, activateEligibleList:ao, generateMoonCatId:Vn, getLootprint:oo, getAccessory:io, isEligibleListActive:$n, getTotalManagedAccessories:jo, totalMoonCats:25440, randomMoonCatId:Wn};
la("libmooncat.jslib.exports", po);
window.LibMoonCat = po;

})();
