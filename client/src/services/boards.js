import axios from 'axios'
const baseUrl = 'http://localhost:9000/api/boards'

let token = null

const setToken = newToken => {
  token = `bearer ${newToken}`
}

const getAll = async () => {
  const response = axios.get(baseUrl)
  return response.then(response => response.data)
}

const create = newObject => {
  const config = {
    headers: { Authorization: token }
  }
  console.log('newObject', newObject)
  const response = axios.post(baseUrl, newObject, config)
  return response.then(response => response.data)
}

const update = (id, newObject) => {
  const config = {
    headers: { Authorization: token }
  }
  const response = axios.put(`${baseUrl}/${id}`, newObject, config)
  return response.then(response => response.data)
}

const remove = id => {
  const response = axios.delete(`${baseUrl}/${id}`)
  return response.then(response => response.data)
}

export default { getAll, create, update, remove, setToken }
