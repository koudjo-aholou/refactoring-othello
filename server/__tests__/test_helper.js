const Ressource = require('../models/ressource')
const User = require('../models/user')

const initialRessources = [
  {
    title: 'Bravosi recipes',
    content: 'George Martin',
    url: 'https://www.urbandictionary.com/define.php?term=not%20gonna%20happen'
  },
  {
    title: 'This is not a ressource',
    content: 'No Author',
    url: 'https://stackoverflow.com/'
  },
  {
    title: 'Third ressource',
    content: 'Elisabeth Giret',
    url: 'https://www.reddit.com/r/learnprogramming/comments/dwzkbv/what_is_bad_programming/',
    likes: 1
  }
]

const initialmodules = [
  {
    title: 'placeholder title'
  },
  {
    title: 'title n°2'
  },
  {
    title: 'third title'
  }
]

const initialUsers = [
  {
    firstName: 'norbert',
    lastName: 'nadir',
    phone: '0608060806',
    email: 'norbert@zenika.com',
    role: 'superadmin',
    id: '5ddc277dec28801edc02aa0a',
    password: 'norbert'
  },
  {
    ressources: [],
    firstName: 'firmin',
    lastName: 'giret',
    phone: '0606060606',
    email: 'firmin@zenika.com',
    role: 'eleve',
    id: '5ddc2792ec28801edc02aa0b',
    password: 'firmin'
  }
]

const initialFollows = [
  {
    title: 'jeremie patonier',
    content: `Le web à la vanille c'est bon, mangez-en 🍦😍 Actuellement Web Advocat chez 
    @ZenikaIT`,
    avatar: 'https://pbs.twimg.com/profile_images/1731588715/jeremie-patonnier-150_400x400.jpg',
    twitter: 'https://twitter.com/JeremiePat',
    github: 'https://github.com/zephimir?tab=repositories',
    medium: 'https://medium.com/crowdbotics/build-a-react-native-app-with-react-hooks-5498e1d5fdf6'
  },
  {
    title: 'Jean Robert',
    content: `How creative can you be with one single SVG square and a bunch of CSS? I'll give my own answer during my lightning talk at 
    @dotCSS
     on Wednesday. In the meantime, share your experiments. I'm looking forwards to see your awesome creation.`,
    avatar: 'https://pbs.twimg.com/profile_images/1080056824345358337/Edqyb2g1_400x400.jpg',
    twitter: 'https://twitter.com/Zephimir',
    github: 'https://gitlab.com/zacademy-paris-2019',
    medium: 'https://medium.com/@prajramesh93/getting-started-with-node-express-and-mysql-using-sequelize-ed1225afc3e0'
  }
]

const nonExistingId = async () => {
  const ressource = new Ressource({ title: 'willremovethissoon' })
  await ressource.save()
  await ressource.remove()

  return ressource._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const ressourcesInDb = async () => {
  const ressources = await Ressource.find({})
  return ressources.map(ressource => ressource.toJSON())
}

module.exports = {
  initialRessources,
  nonExistingId,
  ressourcesInDb,
  usersInDb,
  initialUsers,
  initialmodules,
  initialFollows
}
