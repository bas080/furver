export default function schema (api) {
  return Object.keys(api).reduce((acc, name) => {
    acc.push([name, api[name].length || 0])

    return acc
  }, [])
}
