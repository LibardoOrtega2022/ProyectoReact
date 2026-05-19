import { useEffect, useState, useCallback } from 'react'

export default function useListsAndDetails(activePanel) {
  const [movesList, setMovesList] = useState([])
  const [abilitiesList, setAbilitiesList] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    let active = true

    async function loadLists() {
      if (!activePanel) return
      try {
        setLoadingList(true)
        if (activePanel === 'moves' && movesList.length === 0) {
          const { fetchMoveList } = await import('../api/pokeapi')
          const m = await fetchMoveList()
          if (!active) return
          setMovesList(m || [])
        }
        if (activePanel === 'abilities' && abilitiesList.length === 0) {
          const { fetchAbilityList } = await import('../api/pokeapi')
          const a = await fetchAbilityList()
          if (!active) return
          setAbilitiesList(a || [])
        }
      } catch {
        // ignore
      } finally {
        if (active) setLoadingList(false)
      }
    }

    void loadLists()
    return () => {
      active = false
    }
    // Intentionally track only activePanel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePanel])

  const fetchDetail = useCallback(async (name, panel) => {
    setLoadingDetail(true)
    try {
      if (panel === 'moves') {
        const { fetchMoveDetail } = await import('../api/pokeapi')
        const d = await fetchMoveDetail(name)
        return { type: 'movimiento', name, detail: d }
      }

      if (panel === 'abilities') {
        const { fetchAbilityDetail } = await import('../api/pokeapi')
        const d = await fetchAbilityDetail(name)
        return { type: 'habilidad', name, detail: d }
      }

      return null
    } catch {
      return null
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  return {
    movesList,
    abilitiesList,
    loadingList,
    loadingDetail,
    fetchDetail,
  }
}
