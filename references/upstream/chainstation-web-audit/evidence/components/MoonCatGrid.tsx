'use client'
import { useContext, useEffect, useRef, useState } from 'react'
import MoonCatThumb from './MoonCatThumb'
import MoonCatViewSelector from './MoonCatViewSelector'
import AddToListButton from './AddToListButton'
import Filter from './Filter'
import Pagination from './Pagination'
import LoadingIndicator from './LoadingIndicator'
import useMoonCatListings from 'lib/useMoonCatListings'
import useSignedIn from 'lib/useSignedIn'
import { MoonCatData, MoonCatFilterSettings, TypedFieldMeta } from 'lib/types'
import { MOONCAT_TRAITS_ARB, ONE_HOUR, queryToFilterSettings } from 'lib/util'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { pad } from 'viem'
import { Listing } from 'lib/sequenceData'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import useTabbieHook from 'lib/useTabbieHook'
import { AppVisitorContext } from 'lib/AppVisitorProvider'

const DEFAULT_PER_PAGE = 50
const ACC_MAX = 999

const filterMeta: readonly TypedFieldMeta[] = [
  {
    name: 'classification',
    type: 'select',
    label: 'Classification',
    defaultLabel: 'Any',
    options: {
      genesis: 'Genesis',
      rescue: 'Rescue',
    },
  },
  {
    name: 'hue',
    type: 'select',
    label: 'Hue',
    multiple: true,
    options: {
      white: 'White',
      black: 'Black',
      red: 'Red',
      orange: 'Orange',
      yellow: 'Yellow',
      chartreuse: 'Chartreuse',
      green: 'Green',
      teal: 'Teal',
      cyan: 'Cyan',
      skyblue: 'SkyBlue',
      blue: 'Blue',
      purple: 'Purple',
      magenta: 'Magenta',
      fuchsia: 'Fuchsia',
    },
  },
  {
    name: 'hueInt',
    type: 'min-max',
    label: 'Hue Value',
    options: {
      min: 0,
      max: 359,
    },
  },
  {
    name: 'pale',
    type: 'select',
    label: 'Pale-Colored',
    defaultLabel: 'Any',
    options: {
      no: 'No',
      yes: 'Yes',
    },
  },
  {
    name: 'facing',
    type: 'select',
    label: 'Facing',
    defaultLabel: 'Any',
    options: {
      right: 'Right',
      left: 'Left',
    },
  },
  {
    name: 'expression',
    type: 'select',
    label: 'Expression',
    multiple: true,
    options: {
      smiling: 'Smiling',
      grumpy: 'Grumpy',
      pouting: 'Pouting',
      shy: 'Shy',
    },
  },
  {
    name: 'pattern',
    type: 'select',
    label: 'Coat Pattern',
    multiple: true,
    options: {
      pure: 'Pure',
      tabby: 'Tabby',
      spotted: 'Spotted',
      tortie: 'Tortie',
    },
  },
  {
    name: 'pose',
    type: 'select',
    label: 'Pose',
    multiple: true,
    options: {
      standing: 'Standing',
      sleeping: 'Sleeping',
      pouncing: 'Pouncing',
      stalking: 'Stalking',
    },
  },
  {
    name: 'rescueYear',
    type: 'select',
    label: 'Rescue Year',
    multiple: true,
    options: {
      2017: '2017',
      2018: '2018',
      2019: '2019',
      2020: '2020',
      2021: '2021',
    },
  },
  {
    name: 'named',
    type: 'select',
    label: 'Named',
    defaultLabel: 'Any',
    options: {
      no: 'Not Named',
      yes: 'Named',
      valid: 'String Names',
      invalid: 'Other Names',
    },
  },
  { name: 'nameKeyword', type: 'text', label: 'Name Keyword' },
  {
    name: 'namedYear',
    type: 'select',
    label: 'Named Year',
    multiple: true,
    options: Object.fromEntries(
      Array.from({ length: new Date().getFullYear() - 2016 }, (_, i) => {
        const year = String(2017 + i)
        return [year, year]
      })
    ),
  },
  {
    name: 'accessories',
    type: 'min-max',
    label: 'Owned Accessories',
    options: {
      min: 0,
      max: ACC_MAX,
    },
  },
  {
    name: 'adoptable',
    type: 'select',
    label: 'Adoptable',
    defaultLabel: 'Any',
    options: {
      no: 'No',
      yes: 'Yes',
    },
  },
]

interface FilteredApiPage {
  moonCats: MoonCatData[]
  length: number
  totalLength: number
}

interface SearchState {
  filters: MoonCatFilterSettings
  page: number // Zero-indexed page number
}

interface Props {
  children?: Parameters<typeof MoonCatThumb>[0]['thumbHandler']
  moonCats: number[] | 'all'
  perPage?: number
  extraParams?: Record<string, string>
  isEventActive?: boolean
  showListings?: boolean
}

const MoonCatGrid = ({
  children: thumbHandler,
  moonCats: allMoonCats,
  perPage,
  extraParams,
  isEventActive = false,
  showListings = true,
}: Props) => {
  const [filterState, setFilterState] = useState<SearchState>(() => {
    // On first render, pull the values from the URL
    if (typeof window == 'undefined') {
      return {
        filters: {},
        page: 0,
      }
    }
    const q = new URLSearchParams(window.location.search)
    const f = queryToFilterSettings(Object.fromEntries(q.entries())) ?? {}

    let currentPage = 0
    const pagePreference = q.get('page') ?? null
    if (pagePreference !== null) {
      const p = parseInt(pagePreference)
      if (p > 0) currentPage = p - 1
    }

    return {
      filters: f,
      page: currentPage,
    }
  })

  const router = useRouter()
  const pathname = usePathname()
  const { isSignedIn } = useSignedIn()
  const moonCatListings = useMoonCatListings()

  if (!perPage) {
    perPage = DEFAULT_PER_PAGE
  }

  const params = new URLSearchParams(filterState.filters as Record<string, string>)
  params.set('limit', String(perPage!))
  params.set('offset', String(filterState.page * perPage!))
  if (Array.isArray(allMoonCats)) {
    params.set('mooncats', allMoonCats.join(','))
  } else {
    params.set('mooncats', allMoonCats)
  }
  if (extraParams) {
    for (const key of Object.keys(extraParams)) {
      params.set(key, extraParams[key])
    }
  }

  const filteredData = useQuery({
    queryKey: ['filtered-mooncats', params.toString()],
    queryFn: async (): Promise<FilteredApiPage> => {
      const rs =
        params.get('mooncats') == 'all'
          ? await fetch(`/api/mooncats?${params.toString()}`)
          : await fetch(`/api/mooncats`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(Object.fromEntries(params)),
            })
      if (!rs.ok) throw new Error('Failed to fetch filtered data page')
      return (await rs.json()) as FilteredApiPage
    },
    staleTime: ONE_HOUR,
    placeholderData: (previousData, previousQuery) => {
      if (typeof previousQuery == 'undefined') return previousData
      const previousParams = new URLSearchParams(previousQuery.queryKey[1])
      if (previousParams.get('mooncats') !== params.get('mooncats')) {
        // The overall set of MoonCats has changed; the previous data is not valid
        return undefined
      }
      return previousData
    },
  })

  const {
    state: { awokenMoonCats },
  } = useContext(AppVisitorContext)
  const gridRef = useRef<HTMLDivElement>(null)

  useTabbieHook(filteredData.data?.moonCats, awokenMoonCats, (mc) => {
    const mcThumb = gridRef.current?.querySelector(`#mooncat-${mc.rescueOrder} .thumb-img`)
    if (!mcThumb) {
      console.warn('Failed to find table element for MoonCat', mc)
      return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }
    const bounds = mcThumb.getBoundingClientRect()
    return {
      x: bounds.x + window.scrollX + bounds.width / 2,
      y: bounds.y + window.scrollY + bounds.height - 5,
    }
  })

  /**
   * Event handler for updates from Filter component when a user picks a new filter value
   */
  function handleFilterUpdate(prop: keyof MoonCatFilterSettings, newValue: any) {
    setFilterState((curValue) => {
      let newFilters = Object.assign({}, curValue.filters)
      if (newValue == '') {
        if (!curValue.filters[prop]) {
          // Already blank
          return curValue
        }
        delete newFilters[prop]
      } else if (prop == 'accessories' && Array.isArray(newValue) && newValue[0] == 0 && newValue[1] == ACC_MAX) {
        // Default owned accessories filter
        if (!curValue.filters.accessories) {
          // Already default
          return curValue
        }
        delete newFilters.accessories
      } else if (prop == 'hueInt' && Array.isArray(newValue) && newValue[0] == 0 && newValue[1] == 359) {
        // Default hue integer filter
        if (!curValue.filters.hueInt) {
          // Already default
          return curValue
        }
        delete newFilters.hueInt
      } else {
        // New value being set is a non-blank value
        if (
          Array.isArray(newValue) &&
          Array.isArray(curValue.filters[prop]) &&
          curValue.filters[prop].join(',') == newValue.join(',')
        ) {
          // Array set to same inner objects
          return curValue
        } else if (curValue.filters[prop] == newValue) {
          // Already set to that value
          return curValue
        }
        newFilters[prop] = newValue
      }
      return {
        filters: newFilters,
        page: 0,
      }
    })
  }

  useEffect(() => {
    // Update the query parameter in the URL.
    const params = new URLSearchParams()

    // Only include defined filter values
    for (const key of Object.keys(filterState.filters) as Array<keyof MoonCatFilterSettings>) {
      const value = filterState.filters[key]
      if (typeof value !== 'undefined') {
        if (key == 'accessories') {
          // For the owned-accessories filter, only include it if set to something other than the default
          if (Array.isArray(value) && (value[0] != 0 || value[1] != ACC_MAX)) {
            params.set(key, value.join(','))
          }
        } else if (key == 'hueInt') {
          // For the hue integer filter, only include it if set to something other than the default
          if (Array.isArray(value) && (value[0] != 0 || value[1] != 359)) {
            params.set(key, value.join(','))
          }
        } else if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else {
          params.set(key, String(value))
        }
      }
    }
    if (filterState.page > 0) params.set('page', String(filterState.page + 1))

    // Update the URL in place, which will make the current page bookmark-able or share-able
    const currentLocation = `${pathname}?${window.location.search}${window.location.hash}`
    const targetLocation = `${pathname}?${params}${window.location.hash}`
    if (currentLocation == targetLocation) return
    router.replace(targetLocation, { scroll: false })
  }, [filterState, pathname, router])

  /**
   * Event handler for updates from Pagination component when user navigates to a new page
   */
  function handlePageUpdate(newPage: number) {
    setFilterState((curValue) => {
      if (curValue.page == newPage) {
        // Already set to that value
        return curValue
      }

      return {
        filters: curValue.filters,
        page: newPage,
      }
    })
  }

  const listingMap: Record<number, Listing> = {}
  if (moonCatListings.data) {
    for (const l of moonCatListings.data) {
      listingMap[l.moonCat] = l
    }
  }
  if (!filteredData.data) return <LoadingIndicator message="Herding all the cats..." />

  return (
    <div className="mooncat-grid">
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          padding: '1rem 0',
        }}
        className="text-scrim"
      >
        {filteredData.data.totalLength > 1 && (
          <Filter
            currentFilters={filterState.filters}
            filterMeta={filterMeta}
            filteredCount={filteredData.isRefetching ? undefined : filteredData.data.length}
            totalCount={filteredData.data.totalLength}
            label="MoonCats"
            onChange={handleFilterUpdate}
          />
        )}
        <div style={{ flexGrow: 10 }} />
        <MoonCatViewSelector isEventActive={isEventActive} />
        {isSignedIn && (
          <div style={{ paddingLeft: '1rem' }}>
            <AddToListButton
              targetAddress={MOONCAT_TRAITS_ARB}
              title="Click to add this page of MoonCats to your saved lists"
              targetItems={filteredData.data.moonCats.map((mc) => pad(mc.catId as `0x${string}`, { size: 32 }))}
            />
          </div>
        )}
      </div>
      <div className="item-grid" style={{ margin: '0 0 2rem' }} ref={gridRef}>
        {filteredData.data.moonCats.map((mc) => (
          <MoonCatThumb
            key={mc.rescueOrder}
            id={`mooncat-${mc.rescueOrder}`}
            moonCat={mc}
            listing={showListings ? listingMap[mc.rescueOrder] : undefined}
            isEventActive={isEventActive}
            isAwoken={awokenMoonCats.has(mc.rescueOrder)}
            thumbHandler={thumbHandler}
          />
        ))}
      </div>
      <Pagination
        currentPage={filterState.page}
        maxPage={Math.ceil(filteredData.data.length / perPage) - 1}
        setCurrentPage={handlePageUpdate}
      />
    </div>
  )
}
export default MoonCatGrid
