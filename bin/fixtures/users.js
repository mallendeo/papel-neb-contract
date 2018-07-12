const { P_KEY } = process.env
if (!P_KEY) throw Error('P_KEY required!')

const keyTemplate = P_KEY.substring(0, P_KEY.length - 4)

module.exports = [
  {
    username: 'mallendeo',
    name: 'Mauricio Allende',
    bio: 'UX/UI - Santiago, Chile',
    pkey: P_KEY
  },
  {
    username: 'datboi',
    name: 'Dat Boi',
    bio: 'waddup!',
    pkey: `${keyTemplate}e4f3`
  },
  {
    username: 'somedude',
    name: 'Some Dude',
    bio: 'Web dev',
    pkey: `${keyTemplate}e9f8`
  }
]
