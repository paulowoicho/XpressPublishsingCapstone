const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.get('/', (req, res, next) => {
    db.all(`select * from Issue`, (error, issues) => {
        if(error){
            next(error);
        } else {
            res.status(200).send({issues: issues});
        }
    })
});

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issues.name;
    const issueNumber = req.body.issues.issueNumber;
    const publicationDate = req.body.issues.publicationDate;
    const artistId = req.body.issues.artistId;
    const seriesId = req.body.issues.seriesId;

    if(!name || !issueNumber || !publicationDate || !artistId){
        res.status(400).send();
    }

    db.get(`select * from Artist where id=$id`, {$id: artistId}, (error, artist) => {
        if(error){
            res.status(400).send();
        }else{
            db.run(`insert into Issue (id, name, publication_date, artist_id, series_id)
            values ($id, $name, $publicationDate, $artistId, $seriesId)`, 
            {
                $id: issueNumber,
                $name: name,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $seriesId: seriesId
            }, function(error){
                if(error){
                    next(error);
                }else{
                    db.get(`select * from Series where id=$id`, {$id: seriesId}, (error, series) => {
                        res.status(201).send({series: series})
                    })
                }
            })
        }
    });

});

issuesRouter.param("issueId", (req, res, next, issueId) => {
    db.get("select * from Artist where id=$issueId", { $issueId: issueId }, (error, issue) => {
        if (error) {
            next(error);
        } else {
            if (issues) {
                req.issue = issue;
                next();
            } else {
                res.status(404).send(); //res.sendStatus(404);
            }
        }
    });
});


issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issues.name;
    const issueNumber = req.body.issues.issueNumber;
    const publicationDate = req.body.issues.publicationDate;
    const artistId = req.body.issues.artistId;
    const seriesId = req.body.issues.seriesId;

    if(!name || !issueNumber || !publicationDate || !artistId){
        res.status(400).send();
    };

    db.get(`select * from Artist where id=$id`, {$id: artistId}, (error, artist) => {
        if(error){
            res.status(400).send();
        }else{
            db.run(`update Issue set id=$id, name=$name, publication_date=$publicationDate, artist_id=$artistId, series_id=$seriesId)`, 
            {
                $id: issueNumber,
                $name: name,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $seriesId: seriesId
            }, function(error){
                if(error){
                    next(error);
                }else{
                    db.get(`select * from Series where id=$id`, {$id: seriesId}, (error, series) => {
                        res.status(200).send({series: series})
                    });
                };
            });
        }
    });
})

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run(`delete from Issue where id=$id`, {$id: req.params.issueId}, function(error){
        if(error){
            next(error);
        }else{
            res.status(204).send();
        }
    })
})



module.exports = issuesRouter;