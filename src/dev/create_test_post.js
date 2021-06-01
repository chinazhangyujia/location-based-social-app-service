require('./prepare_db_connection')

const Post = require('../model/post');

const sampleData = [
    {
        "_id" : '000000000000000000000000',
        "imageUrls" : [ 
            "https://location-based-social-app.s3.amazonaws.com/post_image/c2ab08fb-646c-45d0-8ff7-10f4d63cf80d.jpg", 
            "https://location-based-social-app.s3.amazonaws.com/post_image/fe73b349-183a-4901-9b53-1177cbf2fb53.jpg"
        ],
        "content" : "post at apple headquarter 0",
        "location" : {
            "coordinates" : [ 
                -122.0312186, 
                37.33233141
            ],
            "type" : "Point"
        },
        "owner" : "000000000000000000000000",
    },
    {
        "_id" : '000000000000000000000001',
        "imageUrls" : [ 
            "https://location-based-social-app.s3.amazonaws.com/post_image/c2ab08fb-646c-45d0-8ff7-10f4d63cf80d.jpg", 
            "https://location-based-social-app.s3.amazonaws.com/post_image/fe73b349-183a-4901-9b53-1177cbf2fb53.jpg"
        ],
        "content" : "post at apple headquarter 1",
        "location" : {
            "coordinates" : [ 
                -122.0312186, 
                37.33233141
            ],
            "type" : "Point"
        },
        "owner" : "000000000000000000000000",
    },
    {
        "_id" : '000000000000000000000002',
        "imageUrls" : [ 
            "https://location-based-social-app.s3.amazonaws.com/post_image/c2ab08fb-646c-45d0-8ff7-10f4d63cf80d.jpg", 
            "https://location-based-social-app.s3.amazonaws.com/post_image/fe73b349-183a-4901-9b53-1177cbf2fb53.jpg"
        ],
        "content" : "post at apple headquarter 2",
        "location" : {
            "coordinates" : [ 
                -122.0312186, 
                37.33233141
            ],
            "type" : "Point"
        },
        "owner" : "000000000000000000000001",
    },
    {
        "_id" : '100000000000000000000000',
        "imageUrls" : [ 
            "https://location-based-social-app.s3.amazonaws.com/post_image/c2ab08fb-646c-45d0-8ff7-10f4d63cf80d.jpg", 
            "https://location-based-social-app.s3.amazonaws.com/post_image/fe73b349-183a-4901-9b53-1177cbf2fb53.jpg"
        ],
        "content" : "post at DC 0",
        "location" : {
            "coordinates" : [ 
                -77.024642,
                38.908759
            ],
            "type" : "Point"
        },
        "owner" : "000000000000000000000003",
    },
    {
        "_id" : '200000000000000000000000',
        "imageUrls" : [ 
            "https://location-based-social-app.s3.amazonaws.com/post_image/c2ab08fb-646c-45d0-8ff7-10f4d63cf80d.jpg", 
            "https://location-based-social-app.s3.amazonaws.com/post_image/fe73b349-183a-4901-9b53-1177cbf2fb53.jpg"
        ],
        "content" : "post at Beijing 0",
        "location" : {
            "coordinates" : [ 
                116.400839,
                40.136114
            ],
            "type" : "Point"
        },
        "owner" : "000000000000000000000001",
    },
    {
        "_id" : '300000000000000000000000',
        "imageUrls" : [ 
            "https://location-based-social-app.s3.amazonaws.com/post_image/c2ab08fb-646c-45d0-8ff7-10f4d63cf80d.jpg", 
            "https://location-based-social-app.s3.amazonaws.com/post_image/fe73b349-183a-4901-9b53-1177cbf2fb53.jpg"
        ],
        "content" : "post at Tokyo",
        "location" : {
            "coordinates" : [ 
                139.755963,
                35.717237
            ],
            "type" : "Point"
        },
        "owner" : "000000000000000000000002",
    }
]

Post.insertMany(sampleData);