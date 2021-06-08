require('./prepare_db_connection');

const bcrypt = require('bcryptjs');
const { User } = require('../model/user');

const sampleData = (encodedPassword) => [
  {
    _id: '000000000000000000000000',
    name: 'Yujia',
    uniqueName: 'Yujia_0',
    email: 'test@gmail.com',
    password: encodedPassword,
    birthday: '1993-01-01',
    introduction: 'I am a software engineer',
  },
  {
    _id: '000000000000000000000001',
    name: 'Gongxia',
    uniqueName: 'Gongxia_0',
    email: 'test1@gmail.com',
    password: encodedPassword,
    birthday: '1990-01-01',
  },
  {
    _id: '000000000000000000000002',
    name: 'Jake',
    uniqueName: 'Jake_0',
    email: 'test2@gmail.com',
    password: encodedPassword,
    birthday: '1995-01-01',
  },
  {
    _id: '000000000000000000000003',
    name: 'Rex',
    uniqueName: 'Rex_0',
    email: 'test3@gmail.com',
    password: encodedPassword,
    birthday: '1960-01-01',
  },
];

module.exports = async () => {
  await User.collection.drop();

  const encodePassword = await bcrypt.hash('12345677', 8);
  await User.insertMany(sampleData(encodePassword));
};
