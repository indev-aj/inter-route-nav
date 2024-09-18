const routes = [
    {
        "route": "R201",
        "stops": [
            {
                "id": 1,
                "name": "Station A",
                "route": "R201",
                "lat": 1.300736,
                "long": 103.852974
            },
            {
                "id": 2,
                "name": "Station B",
                "route": "R201",
                "lat": 1.302107,
                "long": 103.849337
            },
            {
                "id": 3,
                "name": "Station C",
                "route": "R201",
                "lat": 1.304261,
                "long": 103.845539
            },
            {
                "id": 4,
                "name": "Station D",
                "route": "R201",
                "lat": 1.307110,
                "long": 103.841754
            },
            {
                "id": 5,
                "name": "Station E",
                "route": "R201",
                "lat": 1.309479,
                "long": 103.838435
            }
        ]
    },
    {
        "route": "R202",
        "stops": [
            {
                "id": 6,
                "name": "Station F",
                "route": "R202",
                "lat": 1.309479,   // Same as Station E (intersection point)
                "long": 103.838435
            },
            {
                "id": 7,
                "name": "Station G",
                "route": "R202",
                "lat": 1.312702,
                "long": 103.834657
            },
            {
                "id": 8,
                "name": "Station H",
                "route": "R202",
                "lat": 1.315456,
                "long": 103.831135
            },
            {
                "id": 9,
                "name": "Station I",
                "route": "R202",
                "lat": 1.317432,
                "long": 103.827901
            },
            {
                "id": 10,
                "name": "Station J",
                "route": "R202",
                "lat": 1.320432,
                "long": 103.825234
            }
        ]
    },
    {
        "route": "R203",
        "stops": [
            {
                "id": 11,
                "name": "Station K",
                "route": "R203",
                "lat": 1.301636,   // Approximately 100m north of Station A
                "long": 103.852974
            },
            {
                "id": 12,
                "name": "Station L",
                "route": "R203",
                "lat": 1.302107,   // Same as Station B (intersection point)
                "long": 103.849337
            },
            {
                "id": 13,
                "name": "Station M",
                "route": "R203",
                "lat": 1.296364,
                "long": 103.859178
            },
            {
                "id": 14,
                "name": "Station N",
                "route": "R203",
                "lat": 1.292894,
                "long": 103.862384
            },
            {
                "id": 15,
                "name": "Station O",
                "route": "R203",
                "lat": 1.289753,
                "long": 103.865371
            }
        ]
    }
];

module.exports = routes;
