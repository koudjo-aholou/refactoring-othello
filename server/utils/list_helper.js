const dummy = (blogs) => {
  blogs = 1
  return blogs
}

const totalLikes = (blogs) => {
  let allLikes = 0
  for (const blog of blogs) {
    allLikes += blog.likes
  }
  return allLikes
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((acc, currv) => {
    return acc.likes > currv.likes ? acc : currv
  }, 0)
}

module.exports = {
  dummy, totalLikes, favoriteBlog
}
