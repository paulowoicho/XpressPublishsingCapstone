const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const issuesRouter = require('./issues');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

seriesRouter.use('/:seriesId/issues', issuesRouter);

seriesRouter.get('/', (req, res, next) => {
    db.all("select * from Series", (error, series) => {
        if (error) {
            next(error);
        } else {
            res.status(200).json({ series: series });
        }
    });
});

seriesRouter.param("seriesId", (req, res, next, seriesId) => {
    db.get("select * from Artist where id=$seriesId", { $seriesId: seriesId }, (error, series) => {
        if (error) {
            next(error);
        } else {
            if (series) {
                req.series = series;
                next();
            } else {
                res.status(404).send(); //res.sendStatus(404);
            }
        }
    });
});

seriesRouter.get("/:seriesId", (req, res, next) => {
    res.status(200).json({ artist: req.series });
});

seriesRouter.post("/", (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        res.status(400).send();
    } else {
        db.run("insert into Series (name, decription) values ($name, $description)",
            {
                $name: name,
                $description: description
            }, function (error) {
                db.get("select * from Series where id = $id",
                    {
                        $id: this.lastID
                    }, (error, series) => {
                        res.status(201).json({ series: series });
                    });
            });
    }

});

seriesRouter.put("/:seriesId", (req, res, next) => {
    const name = req.body.series.name;
    const description = req.body.series.description;

    if (!name || !description) {
        res.status(400).send();
    } else {
        db.run("update Series set name= $name, description = $description where id=$id", 
        {
            $id : req.params.seriesId
        }, (error) => {
            if(error){
                next(error)
            } else {
                db.get("select * from series where id=$id", {$id : this.lastID}, (error, series) =>{
                    res.status(200).json({series: series})
                })
            }
        });
    }

})

seriesRouter.delete("/:seriesId", (req, res, next) => {
    db.get(`select * from Issue where series_id=$id`, 
    {$id: req.params.seriesId}, 
    (error, issue) =>{
        if(issue){
            res.status(400).send()
        } else {
            db.run(`delete from Series where id=$id`, {$id: req.params.seriesId}, function(error){
                if(error){
                    next(error);
                }else{
                    res.status(204).send();
                }
            })
        }
    })
});


module.exports = seriesRouter;