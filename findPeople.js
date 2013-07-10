function db() {
    var pg    = require('pg'); 
    var conString = "tcp://user:password@127.0.0.1:5432/dbname";    
    //note: error handling omitted
    var client = new pg.Client(conString);
    return client;
}

function insertPerson(client, params) {
    
    /*
    
    UPDATE table SET field='C', field2='Z' WHERE id=3;
INSERT INTO table (id, field, field2)
       SELECT 3, 'C', 'Z'
       WHERE NOT EXISTS (SELECT 1 FROM table WHERE id=3);
    */
    
    client.query("INSERT INTO sec_people("+
        "cik,person_cik,last_name,first_name,middle_name,suffix,owner_type,transaction_date)"+         
        "values($1,$2,$3,$4,$5,$6,$7,$8)", 
        params,
        function(err, result) {}
    );
    client = null;
    
}

function iterateTable(client, cik, window) {

   var $ = window.$;
                    
    $('a').each( function() {
    
      if($(this).text() == "Owner") {
          var ownershipTable = $(this).parent().parent().parent();
          
          ownershipTable.find('tr').not("tr:first").each(function(){
              var i = 0;
              var person_cik, first_name, last_name, middle_name, suffix, transactionDate, ownerType;
            
              $(this).find('td').each(function(){
    
                 if(i == 0) { // name
                    fullName = $(this).text(); 
                    fullName = fullName.split(" ");
                    /*
                    last_name = fullName[0];
                    first_name = fullName[1];
                    middle_name = fullName[2];
                    suffix = fullName[3];
                    */
                  }
                  if(i == 1) { // person cik
                    person_cik = $(this).text();
                  }
                  if(i==2) {
                      transactionDate = $(this).text();
                  }
                  if(i==3) {
                      ownerType = $(this).text();
                  }
                  
                 i++;
              });
              
              var params = [cik,person_cik,fullName[0],fullName[1],
                            fullName[2],fullName[3],ownerType,transactionDate];
              
              insertPerson(client, params);
              
              params = null;
              fullName = null;
              ownerType = null;
              transactionDate = null;              
              
          });
          
          ownershipTable = null;
      }
    });
                    
}

function searchDOM(client, cik, response) {
    var fs    = require('fs');
    var jsdom = require('jsdom');
    var jquery = fs.readFileSync("./includes/jquery.js").toString();
    
    jsdom.env({
        html: response,
        src: [jquery],
        done: function (errors, window) {
            iterateTable(client, cik, window);
        }    
    });
    
}

function storePeople(client, requests) {
    var xmlScraper = require('./xmlScraper');
    var parseString = require('xml2js').parseString;
    var i = 0;
    
    xmlScraper(
        requests,
        function(err, response, requestOptions) {
        
            if(err || requestOptions == null || requestOptions.cik == null) {
                console.log("ERROR");
                console.log(requestOptions);
                console.log(err);
                return;
            }
            
            var cik = requestOptions.cik;
            
            if(i%50 == 0) {
                console.log(i+"|"+cik);
            }
            i++;
            var $ = null;
                        
            searchDOM(client, cik, response);
    
            response = null;
            requestOptions = null;
        }
        , {
            'reqPerSec': 2 //0.5 = Wait 2sec between each external request
        }
    );
}

var client = db();

client.connect(function(err) {

    var requests = new Array();
    
    //client.query("SELECT cik FROM stocks_sec ORDER BY cik", function(err, result){
    client.query("SELECT * FROM stocks_sec ORDER BY cik", function(err, result) {
        var i=0;
        var length = result.rows.length;
        var rows = result.rows;
        var cik = null;
        
        for(;i<length;++i) {
            cik = rows[i].cik;
            requests.push({
                'uri': 'http://www.sec.gov/cgi-bin/own-disp?action=getissuer&CIK='+ cik,
                'cik': cik,
                'headers': {'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'} 
            });
        }
        
        
        storePeople(client, requests);     
    });
    
    
    
});