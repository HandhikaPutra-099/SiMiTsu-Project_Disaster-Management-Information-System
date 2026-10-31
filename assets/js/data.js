/* ============================================================
   DATA SiMiTsu
   Data historis tsunami dan koordinat peta.
   Letakkan perubahan data di file ini.
   ============================================================ */

  const tsunamiEvents = [
    { id:0,  year:2004, name:"Aceh / Samudera Hindia",        mag:9.1, height:30,  victims:"227.000+", cause:"Megathrust Sumatera"       },
    { id:1,  year:2006, name:"Pangandaran, Jawa Barat",        mag:7.7, height:21,  victims:"668",       cause:"Gempa subduksi"            },
    { id:2,  year:2010, name:"Kepulauan Mentawai",             mag:7.8, height:9,   victims:"408",       cause:"Gempa subduksi"            },
    { id:3,  year:1992, name:"Flores, NTT",                    mag:7.8, height:26,  victims:"2.500",     cause:"Gempa subduksi"            },
    { id:4,  year:2018, name:"Palu-Donggala, Sulawesi",        mag:7.5, height:11,  victims:"4.340+",    cause:"Sesar lokal + likuefaksi"  },
    { id:5,  year:1996, name:"Biak, Papua",                    mag:8.2, height:7,   victims:"166",       cause:"Gempa subduksi"            },
    { id:6,  year:2018, name:"Selat Sunda (Anak Krakatau)",    mag:"-", height:5,   victims:"426",       cause:"Erupsi vulkanik"           },
    { id:7,  year:1950, name:"Maluku Utara",                   mag:8.1, height:10,  victims:"N/A",       cause:"Gempa subduksi"            },
    { id:8,  year:2005, name:"Nias, Sumatera Utara",           mag:8.6, height:3,   victims:"1.313",     cause:"Megathrust"                },
    { id:9,  year:1994, name:"Halmahera/Ternate",              mag:7.0, height:15,  victims:"238",       cause:"Gempa subduksi"            },
    { id:10, year:2018, name:"Lombok, NTB",                    mag:7.0, height:2,   victims:"560",       cause:"Sesar Flores"              },
    { id:11, year:2006, name:"Yogyakarta (off-shore)",         mag:6.3, height:2,   victims:"5.749",     cause:"Gempa tektonik"            },
    { id:12, year:1883, name:"Selat Sunda (Krakatau)",         mag:"-", height:40,  victims:"36.000+",   cause:"Erupsi Krakatau"           },
    { id:13, year:2022, name:"Cianjur, Jawa Barat",            mag:5.6, height:"-", victims:"335",       cause:"Sesar Cugenang"            },
    { id:14, year:2021, name:"Sulawesi Barat",                 mag:6.2, height:1,   victims:"105",       cause:"Sesar Mamuju"              },
    { id:15, year:2000, name:"Bengkulu, Sumatera",             mag:7.9, height:3,   victims:"97",        cause:"Gempa subduksi"            },
    { id:16, year:1977, name:"Sumbawa, NTB",                   mag:8.3, height:9,   victims:"189",       cause:"Gempa subduksi"            },
    { id:17, year:2009, name:"Sumatera Barat (Padang)",        mag:7.6, height:1,   victims:"1.117",     cause:"Gempa subduksi"            },
    { id:18, year:2010, name:"Sumba, NTT",                     mag:7.1, height:2,   victims:"N/A",       cause:"Gempa subduksi"            },
    { id:19, year:2019, name:"Maluku (Ambon)",                 mag:6.5, height:2,   victims:"41",        cause:"Sesar lokal"               },
  ];

  const eventCoords = {
    // Aceh 2004: offshore NW Sumatra epicentre ~3.3°N, 95.9°E
    0:  [3.3, 95.9],
    // Pangandaran 2006: ~9.3°S, 107.3°E
    1:  [-9.3, 107.3],
    // Mentawai 2010: ~3.5°S, 100.1°E
    2:  [-3.5, 100.1],
    // Flores 1992: ~8.5°S, 122.0°E
    3:  [-8.5, 122.0],
    // Palu 2018: ~0.18°S, 119.8°E
    4:  [-0.18, 119.85],
    // Biak 1996: ~0.89°S, 136.0°E
    5:  [-0.89, 136.0],
    // Anak Krakatau 2018: ~6.1°S, 105.4°E
    6:  [-6.1, 105.42],
    // Maluku Utara 1950: ~1.6°N, 128.2°E
    7:  [1.6, 128.2],
    // Nias 2005: ~2.07°N, 97.0°E
    8:  [2.07, 97.0],
    // Halmahera 1994: ~1.05°N, 127.6°E
    9:  [1.05, 127.6],
    // Lombok 2018: ~8.35°S, 116.5°E
    10: [-8.35, 116.5],
    // Yogyakarta 2006: ~9.3°S, 110.4°E
    11: [-9.3, 110.4],
    // Krakatau 1883: ~6.1°S, 105.4°E
    12: [-6.12, 105.42],
    // Cianjur 2022: ~6.86°S, 107.06°E
    13: [-6.86, 107.06],
    // Sulawesi Barat 2021: ~2.98°S, 118.9°E
    14: [-2.98, 118.9],
    // Bengkulu 2000: ~3.95°S, 101.9°E
    15: [-3.95, 101.9],
    // Sumbawa 1977: ~11.1°S, 118.5°E
    16: [-11.1, 118.5],
    // Padang 2009: ~0.79°S, 99.96°E
    17: [-0.79, 99.96],
    // Sumba 2010: ~7.0°S, 122.5°E
    18: [-7.0, 122.5],
    // Ambon 2019: ~3.55°S, 128.5°E
    19: [-3.55, 128.5]
  };
