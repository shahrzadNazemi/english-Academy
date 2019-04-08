
var express = require('express');
var router = express.Router();
let logger = require('../util/logger');
let response = require('../util/responseHelper');
let fs = require('fs')
let config = require('../util/config')
var es = require('elasticsearch');
var client = new es.Client({
    host: config.elasticHost,
    log:"trace"
});



router.post('/', (req, res)=> {
    let str = req.body.search
    fs.readFile('./util/tbl_content.json', 'utf8',   (err, data)=> {
        if(err){
            console.log(err)
        }
        else{
            var result=[];
            data = JSON.parse(data)
            for(var i = 0; i < data.length; i++) {
                if(data[i].en == str){
                    result.push(data[i]);
                }
            }
            if(data.length == 0){
                response.response('اطلاعات ', result, (resi)=> {
                    res.json(resi)
                })
            }
            else{
                response.response('اطلاعات ', result[0], (resi)=> {
                    res.json(resi)
                })
            }
           
        }

    });
});

router.get('/' , (req,res)=>{
    
    client.ping({
        // ping usually has a 3000ms timeout
        requestTimeout: 1000
    }, function (error) {
        if (error) {
            console.trace('elasticsearch cluster is down!');
        } else {
            console.log('All is well');
        }
    });
    fs.readFile('./util/tbl_content.json', {encoding: 'utf-8'}, function(err, data) {
        if (err) { throw err; }
let line = req.query.search
        // Build up a giant bulk request for elasticsearch.
        bulk_request = data.split('\n').reduce(function(bulk_request, line) {
            var obj, recipe;

            try {
                obj = JSON.parse(line);
                console.log("line")
            } catch(e) {
                // console.log('Done reading');
                return bulk_request;
            }

            // Rework the data slightly
            recipe = {
                id: obj._id.$oid, // Was originally a mongodb entry
                name: obj.name,
                source: obj.source,
                url: obj.url,
                recipeYield: obj.recipeYield,
                ingredients: obj.ingredients.split('\n'),
                prepTime: obj.prepTime,
                cookTime: obj.cookTime,
                datePublished: obj.datePublished,
                description: obj.description
            };

            bulk_request.push({index: {_index: 'recipes', _type: 'recipe', _id: recipe.id}});
            bulk_request.push(recipe);
            return bulk_request;
        }, []);

        // A little voodoo to simulate synchronous insert
        var busy = false;
        var callback = function(err, resp) {
            if (err) { console.log(err); }

            busy = false;
        };

        // Recursively whittle away at bulk_request, 1000 at a time.
        var perhaps_insert = function(){
            if (!busy) {
                busy = true;
                client.bulk({
                    body: bulk_request.slice(0, 1000)
                }, callback);
                bulk_request = bulk_request.slice(1000);
                console.log(bulk_request.length);
            }

            if (bulk_request.length > 0) {
                setTimeout(perhaps_insert, 10);
            } else {
                console.log('Inserted all records.');
            }
        };

        perhaps_insert();
    });
})




module.exports = router
