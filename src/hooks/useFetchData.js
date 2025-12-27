import React from 'react'

export default function useFetchData(fetchFn){
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(()=>{
    setLoading(true)
    fetchFn()
      .then(setData)
      .catch(setError)
      .finally(()=>setLoading(false))
  },[fetchFn])

  return { data, loading, error }
}
