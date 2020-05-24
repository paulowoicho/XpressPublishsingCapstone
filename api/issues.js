const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.get('/', (req, res, next) => {
    db.all(`select * from Issue where Issue.series_id = $seriesId`, 
    { 
        $seriesId: req.params.seriesId
    }, (error, issues) => {
        if(error){
            next(error);
        } else {
            res.status(200).send({issues: issues});
        }
    })
});

issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const seriesId = req.params.seriesId;

    if(!name || !issueNumber || !publicationDate || !artistId){
        res.status(400).send();
    }

    db.get(`select * from Artist where id=$id`, {$id: artistId}, (error, artist) => {
        if(error){
            res.status(400).send();
        }else{
            db.run(`insert into Issue (name, issue_number, publication_date, artist_id, series_id)
            values ($name, $issueNumber, $publicationDate, $artistId, $seriesId)`, 
            {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $seriesId: seriesId
            }, function(error){
                if(error){
                    next(error);
                }else{
                    db.get(`select * from Issue where id=$id`, {$id: this.lastID}, (error, issue) => {
                        res.status(201).json({issue: issue})
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
            if (issue) {
                req.issue = issue;
                next();
            } else {
                res.status(404).send(); //res.sendStatus(404);
            }
        }
    });
});


issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    //const seriesId = req.params.seriesId;
    const issueId = req.params.issueId;

    if(!name || !issueNumber || !publicationDate || !artistId){
        res.status(400).send();
    };

    db.get(`select * from Artist where id=$id`, {$id: artistId}, (error, artist) => {
        if(error){
            res.status(400).send();
        }else{
            db.run(`update Issue set name=$name, issue_number = $issueNumber, publication_date=$publicationDate, artist_id=$artistId where id=$id`, 
            {
                $name: name,
                $issueNumber: issueNumber,
                $publicationDate: publicationDate,
                $artistId: artistId,
                $id: issueId,
            }, function(error){
                if(error){
                    next(error);
                }else{
                    db.get(`select * from Issue where id=$id`, {$id: issueId}, (error, issue) => {
                        res.status(200).json({issue: issue})
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