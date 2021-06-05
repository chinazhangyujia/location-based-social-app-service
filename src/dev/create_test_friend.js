require('./prepare_db_connection');

const Friend = require('../model/friend');

const sampleData = [
  {
    _id: '000000000000000000000000',
    user: '000000000000000000000000',
    friendUser: '000000000000000000000001',
    status: 'active',
  },
  {
    _id: '000000000000000000000001',
    user: '000000000000000000000001',
    friendUser: '000000000000000000000000',
    status: 'active',
  },
  {
    _id: '000000000000000000000002',
    user: '000000000000000000000000',
    friendUser: '000000000000000000000002',
    status: 'active',
  },
  {
    _id: '000000000000000000000003',
    user: '000000000000000000000002',
    friendUser: '000000000000000000000000',
    status: 'active',
  },
  {
    _id: '000000000000000000000004',
    user: '000000000000000000000001',
    friendUser: '000000000000000000000002',
    status: 'active',
  },
  {
    _id: '000000000000000000000005',
    user: '000000000000000000000002',
    friendUser: '000000000000000000000001',
    status: 'active',
  },
  {
    _id: '000000000000000000000006',
    user: '000000000000000000000001',
    friendUser: '000000000000000000000003',
    status: 'active',
  },
  {
    _id: '000000000000000000000007',
    user: '000000000000000000000003',
    friendUser: '000000000000000000000001',
    status: 'active',
  },
];

module.exports = async () => {
  await Friend.collection.drop();
  await Friend.insertMany(sampleData);
};
