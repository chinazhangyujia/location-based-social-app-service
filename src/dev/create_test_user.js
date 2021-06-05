require('./prepare_db_connection');

const { User } = require('../model/user');

const sampleData = [
  {
    _id: '000000000000000000000000',
    name: 'Yujia',
    uniqueName: 'Yujia_0',
    email: 'test@gmail.com',
    password: '12345677',
    birthday: '1993-01-01',
    introduction: 'I am a software engineer',
  },
  {
    _id: '000000000000000000000001',
    name: 'Gongxia',
    uniqueName: 'Gongxia_0',
    email: 'test1@gmail.com',
    password: '12345677',
    birthday: '1990-01-01',
  },
  {
    _id: '000000000000000000000002',
    name: 'Jake',
    uniqueName: 'Jake_0',
    email: 'test2@gmail.com',
    password: '12345677',
    birthday: '1995-01-01',
  },
  {
    _id: '000000000000000000000003',
    name: 'Rex',
    uniqueName: 'Rex_0',
    email: 'test3@gmail.com',
    password: '12345677',
    birthday: '1960-01-01',
  },
];

module.exports = async () => {
  await User.collection.drop();
  await User.insertMany(sampleData);
};
