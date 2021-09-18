require('./prepare_db_connection');

const Post = require('../model/post');

const sampleData = [
  {
    _id: '000000000000000000000000',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/63eda9ca-c8a8-4130-b22c-91bf428e4c99.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
    ],
    content: 'post at apple headquarter 0',
    location: {
      coordinates: [
        -122.0312186,
        37.33233141,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000000',
    topic: 'FOOD',
  },
  {
    _id: '000000000000000000000001',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/8f552aab-dcb0-4341-9ee1-474acd63caa5.jpg',
    ],
    content: 'post at apple headquarter 1',
    location: {
      coordinates: [
        -122.0312186,
        37.33233141,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000000',
    topic: 'WORK',
  },
  {
    _id: '000000000000000000000002',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/8f552aab-dcb0-4341-9ee1-474acd63caa5.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/63eda9ca-c8a8-4130-b22c-91bf428e4c99.jpg',
    ],
    content: 'post at apple headquarter 2',
    location: {
      coordinates: [
        -122.0312186,
        37.33233141,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000001',
    topic: 'STREET_VIEW',
  },
  {
    _id: '100000000000000000000000',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/63eda9ca-c8a8-4130-b22c-91bf428e4c99.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
    ],
    content: 'post at DC 0',
    location: {
      coordinates: [
        -77.024642,
        38.908759,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000003',
    topic: 'ENTERTAINMENT',
  },
  {
    _id: '100000000000000000000001',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/8f552aab-dcb0-4341-9ee1-474acd63caa5.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/63eda9ca-c8a8-4130-b22c-91bf428e4c99.jpg',
    ],
    content: 'post at DC 1',
    location: {
      coordinates: [
        -77.024642,
        38.908759,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000003',
    topic: 'FRIENDS',
  },
  {
    _id: '100000000000000000000002',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/8f552aab-dcb0-4341-9ee1-474acd63caa5.jpg',
    ],
    content: 'post at DC 2',
    location: {
      coordinates: [
        -77.024642,
        38.908759,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000001',
    topic: 'WORK',
  },
  {
    _id: '200000000000000000000000',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/63eda9ca-c8a8-4130-b22c-91bf428e4c99.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
    ],
    content: 'post at Beijing 0',
    location: {
      coordinates: [
        116.400839,
        40.136114,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000001',
    topic: 'FOOD',
  },
  {
    _id: '200000000000000000000001',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/8f552aab-dcb0-4341-9ee1-474acd63caa5.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/63eda9ca-c8a8-4130-b22c-91bf428e4c99.jpg',
    ],
    content: 'post at Beijing 1',
    location: {
      coordinates: [
        116.400839,
        40.136114,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000003',
    topic: 'WORK',
  },
  {
    _id: '200000000000000000000002',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/63eda9ca-c8a8-4130-b22c-91bf428e4c99.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
    ],
    content: 'post at Beijing 2',
    location: {
      coordinates: [
        116.400839,
        40.136114,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000000',
    topic: 'STREET_VIEW',
  },
  {
    _id: '300000000000000000000000',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/63eda9ca-c8a8-4130-b22c-91bf428e4c99.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
    ],
    content: 'post at Tokyo 0',
    location: {
      coordinates: [
        139.755963,
        35.717237,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000002',
    topic: 'WORK',
  },
  {
    _id: '300000000000000000000001',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/8f552aab-dcb0-4341-9ee1-474acd63caa5.jpg',
    ],
    content: 'post at Tokyo 1',
    location: {
      coordinates: [
        139.755963,
        35.717237,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000001',
    topic: 'FOOD',
  },
  {
    _id: '300000000000000000000002',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/8f552aab-dcb0-4341-9ee1-474acd63caa5.jpg',
    ],
    content: 'post at Tokyo 2',
    location: {
      coordinates: [
        139.755963,
        35.717237,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000003',
    topic: 'ENTERTAINMENT',
  },
  {
    _id: '300000000000000000000003',
    imageUrls: [
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/2e2e76af-742d-427a-b343-5ca43d613ddc.jpg',
      'https://location-based-social-app-images.s3.amazonaws.com/post_image/8f552aab-dcb0-4341-9ee1-474acd63caa5.jpg',
    ],
    content: 'long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo'
    + 'long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo'
    + 'long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo long post at Tokyo',
    location: {
      coordinates: [
        139.755963,
        35.717237,
      ],
      type: 'Point',
    },
    owner: '000000000000000000000001',
    topic: 'WORK',
  },
];

module.exports = async () => {
  await Post.collection.drop();
  await Post.insertMany(sampleData);
};
