/**
 * Created by Anjaneyulu on 2/12/2017.
 */
$(function () {
    var swRegistration;
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');
        navigator.serviceWorker.register('sw.js')
        .then(function(swReg) {
          console.log('Service Worker is registered', swReg);
          swRegistration = swReg;
        })
        .catch(function(error) {
          console.error('Service Worker Error', error);
        });
    } else {
        console.warn('Push messaging is not supported');
    }
    var url = 'https://anji.000webhostapp.com/mmts.php';
    var connectingPaths = {
        "F_S": [
            "Faluknama", "Huppuguda", "Yakutpura", "Dabirpura", "Malakpet", "Kacheguda", "Vidyanagar", "Jamai Osmania", "Arts College", "Sitafalmandi", "Secunderabad"
        ],
        "S_SA": [
            "Secunderabad", "James Street", "Sanjeevaiah Park"
        ],
        "SA_B": [
            "Sanjeevaiah Park", "Begumpet"
        ],
        "B_L": [
            "Begumpet", "Nature Cure Hospital", "Fatehnagar", "Bharatnagar", "Borabanda", "Hitech City", "Hafeezpet", "Chandanagar", "Lingampalli"
        ],
        "SA_N": [
            "Sanjeevaiah Park", "Necklace Road"
        ],
        "N_H": [
            "Necklace Road", "Khairatabad", "Lakdikapul", "Hyderabad"
        ],
        "N_B": [
            "Necklace Road", "Begumpet"
        ]
    };
    var routeMaps = {
        "FL": {
            "stations": [].concat(connectingPaths.F_S).concat(connectingPaths.S_SA.slice(1)).concat(connectingPaths.SA_B.slice(1)).concat(connectingPaths.B_L.slice(1))
        },
        "HL": {
            "stations": [].concat(connectingPaths.N_H).reverse().concat(connectingPaths.N_B.slice(1)).concat(connectingPaths.B_L.slice(1))
        },
        "FH": {
            "stations": [].concat(connectingPaths.F_S).concat(connectingPaths.S_SA.slice(1)).concat(connectingPaths.SA_N.slice(1)).concat(connectingPaths.N_H.slice(1))
        },
        "FS": {
            "stations": [].concat(connectingPaths.F_S.slice())
        },
        "SL": {
            "stations": [].concat(connectingPaths.S_SA).concat(connectingPaths.SA_B.slice(1)).concat(connectingPaths.B_L.slice(1))
        }
    };
    var stationList=[].concat(routeMaps.FL.stations).concat(connectingPaths.N_H).sort();
    var optionsList="";
    for(var index in stationList){
        optionsList+="<option>"+stationList[index]+"</option>"
    }
    $("#from, #to").html(optionsList);
    var routes = [
        {"route": "FL", "view": "true"},
        {"route": "LF", "view": "true"},
        {"route": "HL", "view": "true"},
        {"route": "LH", "view": "true"},
        {"route": "FH", "view": "true"},
        {"route": "HF", "view": "true"}/*,
         {"route": "SL", "view": "false"},
         {"route": "LS", "view": "false"},
         {"route": "SF", "view": "false"},
         {"route": "FS", "view": "false"}*/
    ];
    function getRoute(source, destination) {
        var routeCodes = [];
        for (var routeMap in routeMaps) {
            var sourceIndex = routeMaps[routeMap].stations.indexOf(source);
            var destinationIndex = routeMaps[routeMap].stations.indexOf(destination);
            if (sourceIndex != -1 && destinationIndex != -1 && sourceIndex!=destinationIndex) {
                if (sourceIndex > destinationIndex)
                    routeCodes.push(routeMap.split("").reverse().join(""))
                else
                    routeCodes.push(routeMap)
            }
        }
        return routeCodes;
    }
    function handleDefaultView(data, success){
        var status = "";
        if(success){
            var jsonObject = JSON.parse(data);
            if(Object.keys(jsonObject).length){
                for (var routeIndex in routes) {
                    status="";
                    var route = routes[routeIndex].route;
                    var defaultView = routes[routeIndex].view;
                    var trains = jsonObject[route];
                    if (trains) {
                        for (var i = 0; i < trains.length; i++) {
                            var train = trains[i];
                            status += "<tr><th>" + (i + 1) + "</th><td>" + train.Trainno + "</td><td>" + train.Station + "</td></tr>";
                        }
                        $("#" + route).html(status);
                    } else {
                        status = '<tr><td colspan="3" style="text-align:center;">No train found!</td></tr>';
                        $("#" + route).html(status);
                    }
                }
            }else{
                status = '<tr><td colspan="3" style="text-align:center;">No train found!</td></tr>';
                $(".defaultResult").html(status);
            }
        }else{
            status = '<tr><td colspan="3" style="text-align:center;">failed to retrieve data.Try again after some time!</td></tr>';
            $(".defaultResult").html(status);
        }
    }
    function handleCustonView(data, success){
        var status = "";
        if(success){
            var routeList = getRoute($("#from").val(), $("#to").val());
            if(routeList.length){
                var jsonObject = JSON.parse(data);
                if(Object.keys(jsonObject).length){
                    for(var index in routeList){
                        var route = routeList[index];
                        var trains = jsonObject[route];
                        if(trains){
                            for (var i = 0; i < trains.length; i++) {
                                var train = trains[i];
                                status += "<tr><!--<th>" + (i + 1) + "</th>--><td>" + train.Trainno + "</td><td>" + train.Station + "</td></tr>";
                            }
                        }
                    }
                }
                if(!status)
                    status = '<tr><td colspan="3" style="text-align:center;">No trains found!</td></tr>';
            }else{
                status = '<tr><td colspan="3" style="text-align:center;">No route found!</td></tr>';
            }
        }else{
            status = '<tr><td colspan="3" style="text-align:center;">failed to retrieve data.Try again after some time!</td></tr>';
        }
        $("#result").html(status);
    }
    var timerID=[];
    function status() {
        $.ajax({
            url: url,
            success: function (data, textStatus, jqXHR) {
                handleDefaultView(data, true);
                handleCustonView(data, true);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handleDefaultView(textStatus, false);
                handleCustonView(textStatus, false);
                console.log("failed to retrieve data!");
            },
            complete: function (jqXHR, textStatus) {
                clearTimeout(timerID);
                timerID = (textStatus == "success")? setTimeout(status, 15000) : setTimeout(status, 30000);
            }
        });
    }
    $("#search").click(function () {
        status();
    });
    $("#flipView").click(function(){
       $("#customView").toggleClass("hidden");
        $("#defaultView").toggleClass("hidden");
        if($("#flipView").text().toLowerCase() == 'search')
            $("#flipView").text("Home")
        else
            $("#flipView").text("Search");
    });
    status();
});
