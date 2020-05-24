const express = require('express');
const artistRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


artistRouter.get('/', (req, res, next) => {
    db.all("select * from Artist where is_currently_employed=1", (error, artists) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({ artists: artists });
        }
    });
});

artistRouter.param("artistId", (req, res, next, artistId) => {
    db.get("select * from Artist where id=$artistId", { $artistId: artistId }, (error, artist) => {
        if (error) {
            next(error);
        } else {
            if (artist) {
                req.artist = artist;
                next();
            } else {
                res.status(404).send(); //res.sendStatus(404);
            }
        }
    });
});

artistRouter.get("/:artistId", (req, res, next) => {
    res.status(200).json({ artist: req.artist });
})


artistRouter.post("/", (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;

    if (!name || !dateOfBirth || !biography) {
        res.status(400).send();
    } else {
        db.run("insert into Artist (name, date_of_birth, biography, is_currently_employed) values ($name, $dateOfBirth, $biography, $is_currently_employed)",
            {
                $name: name,
                $dateOfBirth: dateOfBirth,
                $biography: biography,
                $is_currently_employed: isCurrentlyEmployed
            }, function (error) {
                if (error) {
                    next(error);
                } else {
                    db.get("select * from artist where id=$id", { $id: this.lastID }, (error, artist) => {
                        res.status(201).json({ artist: artist });
                    })
                }
            });
    }


});

artistRouter.put("/:artistId", (req, res, next) => {
    const name = req.body.artist.name;
    const dateOfBirth = req.body.artist.dateOfBirth;
    const biography = req.body.artist.biography;
    const isCurrentlyEmployed = req.body.is_currently_employed;

    if (!name || !dateOfBirth || !biography) {
        res.status(400).send();
    } else {
        db.run("update Artist set name=$name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed where id=$id",
            {
                $name: name,
                $dateOfBirth: dateOfBirth,
                $biography: biography,
                $isCurrentlyEmployed: isCurrentlyEmployed,
                $id: req.params.artistId
            }, (error) => {
                if (error) {
                    next(error);
                } else {
                    db.get("select * from Artist where id=$id",
                        {
                            $id: req.params.artistId
                        },
                        (error, artist) => {
                            res.status(200).json({ artist: artist });
                        })
                }
            });
    }


});


artistRouter.delete(`/:artistId`, (req, res, next) => {
    db.run("update is_currently_employed = 0 where id=$id",
        {
            $id: req.params.artistId
        }, (error) => {
            if (error) {
                next(error);
            } else {
                db.get("select * from Artist where id=$id",
                    {
                        $id: req.params.artistId
                    },
                    (error, artist) => {
                        res.status(200).json({ artist: artist });
                    })
            }
        });
});

module.exports = artistRouter;