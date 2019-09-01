//Initialize Libraries needed
const request = require('request');
//Put Explorer api link here,Iquidus is preffered atm and supported
var explorerAPILink = "http://159.69.33.243:3001/api/";
var explorerType = "iquidus"//Supported explorers are Iquidus,Blockbook and Bulwark atm
var blockspacing = 50000;
//get this number from last block on explorer
var currentblock = 581563;
//Set true or false depending on your requirement
var fBreadwallet = false;
var fisPIVXFork = false;
var fisEnergiFork = true;
var totaltx = 123456;//get this from the tx=... number in the SetBestChain debug.log lines
var i = 0;
function generateCheckpoints(blockdelay, blockcountcurr) {
    if (i <= blockcountcurr) {
        if (i + blockdelay > blockcountcurr || i > blockcountcurr) 
            i = blockcountcurr;
        else if (i == 1) 
            i = blockdelay;
        else if (i == 0) {
            outputdatax = "";
        } else 
            i += blockdelay - 1;
        
        //Get block hash
        request(explorerAPILink + 'getblockhash?index=' + i, {
            json: false
        }, (err, res, body) => {
            currblockhash = body;
            //now that we got blockhash,get block data and parse it to needed info
            ConvertBlockData(body,i);
            //Call the func in of itself,emulating a for loop type situation.
            generateCheckpoints(blockspacing, currentblock);
        });
    }
    i += 1;
}
function ConvertBlockData(currblockhash,blockheight) {
    var outputdata = ""
    if(explorerType == "iquidus"){
    request(explorerAPILink + 'getblock?hash=' + currblockhash, {json: true}, (err, res, body) => {
        var blockheightx =  body.height;
        var blocktime = body.time;
        var blockbits  = body.bits;
        if (fBreadwallet) {
            var hashinquotes = '"' + body.hash + '"';
            if (blockheightx == 0 || blockheightx < currentblock) { //genesis block or after gn
                outputdata = "{" + blockheightx + ",uint256(" + hashinquotes + "), " + blocktime + ",0x" + blockbits + "},";
            } else if (blockheightx == currentblock) { //last block in checkpoints,so dont add , at end of output data
                outputdata = "{" + blockheightx + ",uint256(" + hashinquotes + "), " + blocktime + ",0x" + blockbits + "}";
            }
            console.log(outputdata)
        } else if (fisPIVXFork) {
            var hashinquotes = '"0x' + body.hash + '"';
            if (blockheightx == 0) { //genesis block
                outputdata = "static Checkpoints::MapCheckpoints mapCheckpoints = \n";
                outputdata += "boost::assign::map_list_of\n";
                outputdata += "(" + blockheightx + ",uint256(" + hashinquotes + "))";
            } else if (blockheightx < currentblock && blockheightx > 0) {
                outputdata = "(" + blockheightx + ",uint256(" + hashinquotes + "))";
            } else if (blockheightx == currentblock) { //last block in checkpoints,so dont add , at end of output data
                outputdata = "(" + blockheightx + ",uint256(" + hashinquotes + "));\n";
                outputdata += "static const Checkpoints::CCheckpointData data = {"
                         +"\n&mapCheckpoints,\n" 
                         +blocktime + ",// * UNIX timestamp of last checkpoint block\n" 
                         +totaltx+",    // * total number of transactions between genesis and last checkpoint\n" +
                         "              //   (the tx=... number in the SetBestChain debug.log lines)\n" + 
                         2000 + "       // * estimated number of transactions per day after checkpoint\n};";
            }
            console.log(outputdata)
        }
        else if (fisEnergiFork) {
            var hashinquotes = '"0x' + body.hash + '"';
            if (blockheightx == 0) { //genesis block
                outputdata = "        checkpointData = {" +
                "\n{\n{"+blockheightx+",uint256S("+hashinquotes+")},\n";
            } else if (blockheightx < currentblock && blockheightx > 0) {
               outputdata = "{"+blockheightx+",uint256S("+hashinquotes+")},\n";
            } else if (blockheightx == currentblock) { //last block in checkpoints,so dont add , at end of output data
               outputdata = "{"+blockheightx+",uint256S("+hashinquotes+")}\n}\n};\n";
               outputdata += "\nchainTxData = ChainTxData{\n"
               +blocktime + ",// * UNIX timestamp of last checkpoint block\n" 
                         +totaltx+",    // * total number of transactions between genesis and last checkpoint\n" +
                         "              //   (the tx=... number in the SetBestChain debug.log lines)\n" + 
                         2000 + "       // * estimated number of transactions per day after checkpoint\n};";
            }
            console.log(outputdata)
        }
    });
}
    else if(explorerType == "bulwark"){
       request(explorerAPILink + '/block/' + blockheight, {json: true}, (err, res, body) => {

        var hashinquotes = '"' + body.hash + '"';
        var blockheightx =  body.height;
        var blocktime = new Date(body.createdAt).getTime() / 1000;//get epoch from createdAt
        var blockbits  = body.bits;
        if (fBreadwallet) {
            if (body.height == 0 || body.height < currentblock) { //genesis block or after gn
                outputdata = "{" + body.height + ",uint256(" + hashinquotes + "), " + timeEpoch + ",0x" + blockbits + "},";
            } else if (body.height == currentblock) { //last block in checkpoints,so dont add , at end of output data
                outputdata = "{" + body.height + ",uint256(" + hashinquotes + "), " + timeEpoch + ",0x" + blockbits + "}";
            }
            console.log(outputdata)
        } else if (fisPIVXFork) {
            if (blockheightx == 0) { //genesis block
                outputdata = "static Checkpoints::MapCheckpoints mapCheckpoints = \n";
                outputdata += "boost::assign::map_list_of\n";
                outputdata += "(" + blockheightx + ",uint256(" + hashinquotes + "))";
            } else if (blockheightx < currentblock && blockheightx > 0) {
                outputdata = "(" + blockheightx + ",uint256(" + hashinquotes + "))";
            } else if (blockheightx == currentblock) { //last block in checkpoints,so dont add , at end of output data
                outputdata = "(" + blockheightx + ",uint256(" + hashinquotes + "));\n";
                outputdata += "static const Checkpoints::CCheckpointData data = {"
                         +"\n&mapCheckpoints,\n" 
                         +blocktime + ",// * UNIX timestamp of last checkpoint block\n" 
                         +totaltx+",    // * total number of transactions between genesis and last checkpoint\n" +
                         "              //   (the tx=... number in the SetBestChain debug.log lines)\n" + 
                         2000 + "       // * estimated number of transactions per day after checkpoint\n};";
            }
            console.log(outputdata)
        }
        else if (fisEnergiFork) {
             hashinquotes = '"0x' + body.hash + '"';
            if (blockheightx == 0) { //genesis block
                outputdata = "        checkpointData = {" +
                "\n{\n{"+blockheightx+",uint256S("+hashinquotes+")},\n";
            } else if (blockheightx < currentblock && blockheightx > 0) {
               outputdata = "{"+blockheightx+",uint256S("+hashinquotes+")},\n";
            } else if (blockheightx == currentblock) { //last block in checkpoints,so dont add , at end of output data
               outputdata = "{"+blockheightx+",uint256S("+hashinquotes+")}\n}\n};\n";
               outputdata += "\nchainTxData = ChainTxData{\n"
               +timeEpoch + ",// * UNIX timestamp of last checkpoint block\n" 
                         +totaltx+",    // * total number of transactions between genesis and last checkpoint\n" +
                         "              //   (the tx=... number in the SetBestChain debug.log lines)\n" + 
                         2000 + "       // * estimated number of transactions per day after checkpoint\n};";
            }
            console.log(outputdata)
        }
    });
  }

  else if(explorerType == "blockbook"){
    request(explorerAPILink + '/block/' + blockheight, {json: true}, (err, res, body) => {
     var hashinquotes = '"' + body.hash + '"';
     var blockheightx =  body.height;
     var blocktime = body.time;
     var blockbits  = body.bits;
     if (fBreadwallet) {
        if (blockheightx == 0 || blockheightx < currentblock) { //genesis block or after gn
            outputdata = "{" + blockheightx + ",uint256(" + hashinquotes + "), " + blocktime + ",0x" + blockbits + "},";
        } else if (blockheightx == currentblock) { //last block in checkpoints,so dont add , at end of output data
            outputdata = "{" + blockheightx + ",uint256(" + hashinquotes + "), " + blocktime + ",0x" + blockbits + "}";
        }
        console.log(outputdata)
    } else if (fisPIVXFork) {
        if (blockheightx == 0) { //genesis block
            outputdata = "static Checkpoints::MapCheckpoints mapCheckpoints = \n";
            outputdata += "boost::assign::map_list_of\n";
            outputdata += "(" + blockheightx + ",uint256(" + hashinquotes + "))";
        } else if (blockheightx < currentblock && blockheightx > 0) {
            outputdata = "(" + blockheightx + ",uint256(" + hashinquotes + "))";
        } else if (blockheightx == currentblock) { //last block in checkpoints,so dont add , at end of output data
            outputdata = "(" + blockheightx + ",uint256(" + hashinquotes + "));\n";
            outputdata += "static const Checkpoints::CCheckpointData data = {"
                     +"\n&mapCheckpoints,\n" 
                     +blocktime + ",// * UNIX timestamp of last checkpoint block\n" 
                     +totaltx+",    // * total number of transactions between genesis and last checkpoint\n" +
                     "              //   (the tx=... number in the SetBestChain debug.log lines)\n" + 
                     2000 + "       // * estimated number of transactions per day after checkpoint\n};";
        }
        console.log(outputdata)
    }
    else if (fisEnergiFork) {
        var hashinquotes = '"0x' + body.hash + '"';
        if (blockheightx == 0) { //genesis block
            outputdata = "checkpointData = {\n" +
            "\n{\n{"+blockheightx+",uint256S("+hashinquotes+")},\n";
        } else if (blockheightx < currentblock && blockheightx > 0) {
           outputdata = "{"+blockheightx+",uint256S("+hashinquotes+")},\n";
        } else if (blockheightx == currentblock) { //last block in checkpoints,so dont add , at end of output data
           outputdata = "{"+blockheightx+",uint256S("+hashinquotes+")}\n}\n};\n";
           outputdata += "\nchainTxData = ChainTxData{\n"
                     +blocktime + ",// * UNIX timestamp of last checkpoint block\n" 
                     +totaltx+",    // * total number of transactions between genesis and last checkpoint\n" +
                     "              //   (the tx=... number in the SetBestChain debug.log lines)\n" + 
                     2000 + "       // * estimated number of transactions per day after checkpoint\n};";
        }
        console.log(outputdata)
    }
   });
 }

}
generateCheckpoints(blockspacing, currentblock);