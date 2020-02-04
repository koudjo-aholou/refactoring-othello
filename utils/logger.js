// args params : ["status", "urlMongo"]

const info = (...params) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(...params, "parametre info ds logger ")
  }
}

const error = (...params) => {
  console.error(...params)
}

module.exports = {
  info, error
}
