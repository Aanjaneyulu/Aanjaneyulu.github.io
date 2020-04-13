$(function(){
    var config = {
        apiKey: "AIzaSyBwCO64tTnio9pe82S4u_4ey5PiAUu4v1U",
        authDomain: "kony-messaging.firebaseapp.com",
        databaseURL: "https://kony-messaging.firebaseio.com",
        projectId: "kony-messaging",
        storageBucket: "kony-messaging.appspot.com",
        messagingSenderId: "278748258522"
    };
    firebase.initializeApp(config);

    const messaging = firebase.messaging();

    messaging.onMessage(function(payload) {
        console.log("Message received. ", payload);
        $("#messageContainer").show();
        $("#messageContainer #message").text(JSON.stringify(payload, undefined,4));
    });

    var swRegistration;
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        console.log('Service Worker and Push is supported');
        navigator.serviceWorker.register('./sw.js')
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

    // Form Handling
    $("#subscribeUser").click(function(){
        event.preventDefault();
        messaging
            .requestPermission()
            .then(function () {
                console.log("Notification permission granted.");
                return messaging.getToken();
            })
            .then(function(token) {
                console.log("token:",token);
                subscribeUser(token);
            })
            .catch(function (err) {
                console.log("Unable to get permission to notify.", err);
                alert("Unable to get permission to notify.");
            });
    });

    var eventPayload = {
        "event": {
            "eventid": "6916989615158515823",
            "message": {
                "subscribers": {
                    "subscriber": [
                        {
                            "ksid": "",
                        }
                    ]
                },
                "content": {
                    "mimeType": "text/plain",
                    "priorityService": "true"
                }
            }
        }
    };
    $("#triggerEvent").click(function(){
        var url = $("#url").val();
        eventPayload.event.message.subscribers.subscriber[0].ksid = getKSID();
        $.ajax({
            url : url+"/api/v1/events/push",
            data : JSON.stringify(eventPayload),
            method : "POST",
            contentType : "application/json",
            success: function (data, textStatus, jqXHR) {
                console.log(data);
                $("#eventResponseContainer").removeClass("alert-danger");
                $("#eventResponseContainer").addClass("alert-success");
                $("#eventResponseContainer .eventResponseMessage").text("Triggered Successfully!");
                $("#eventResponseContainer").fadeIn("slow");
                $("#eventResponseContainer").fadeOut(5000);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                $("#eventResponseContainer").removeClass("alert-success");
                $("#eventResponseContainer").addClass("alert-danger");
                $("#eventResponseContainer .eventResponseMessage").text("Failed to trigger Push!");
                $("#eventResponseContainer").fadeIn("slow");
                $("#eventResponseContainer").fadeOut(5000);
            }
        });
    });

    function subscribeUser(token){
        var appId = $("#appId").val();
        var url = $("#url").val();
        var ufid = $("#email").val();
        var subscriptionData = {};
        subscriptionData.sid = token;
        subscriptionData.appId = appId;
        subscriptionData.ufid = ufid;
        subscriptionData.osType = "webfcm";
        subscriptionData.deviceId = token;
        var subscriptionPayload = {};
        subscriptionPayload.subscriptionService={};
        subscriptionPayload.subscriptionService.subscribe = subscriptionData;
        $.ajax({
            url : url+"/api/v1/subscribers",
            data : JSON.stringify(subscriptionPayload),
            method : "POST",
            contentType : "application/json",
            success: function (data, textStatus, jqXHR) {
                var ksid = JSON.parse(data).id;
                storeKSID(ksid);
                subscribeAudience(ksid);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                $("#responseContainer").show();
                $("#responseContainer #response").text(jqXHR.responseText);
            }
        });
    }

    function subscribeAudience(ksid){
        var subscribeAudience = {};
        subscribeAudience.ksid = ksid;
        subscribeAudience.firstName = $("#firstName").val();
        subscribeAudience.lastName = $("#lastName").val();
        subscribeAudience.email = $("#email").val();
        subscribeAudience.mobileNumber = $("#mobile").val();
        subscribeAudience.country = $("#country").val();
        subscribeAudience.state = $("#state").val();
        subscribeAudience.smsSubscription = $("#smsSubscription").prop("checked");
        subscribeAudience.emailSubscription = $("#emailSubscription").prop("checked");
        var appId = $("#appId").val();
        var url = $("#url").val();
        $.ajax({
            url : url+"/api/v1/subscribeaudience",
            data : JSON.stringify(subscribeAudience),
            method : "POST",
            contentType : "application/json",
            success: function (data, textStatus, jqXHR) {
                $("#responseContainer").show();
                var msg = {};
                msg.ksid = ksid;
                msg.messgae = "User Added Successfully";
                $("#responseContainer #response").text(JSON.stringify(msg,undefined,4));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
                $("#responseContainer").show();
                $("#responseContainer #response").text(jqXHR.responseText);
            }
        });
    }

    var KSID;
    function storeKSID(ksid){
        KSID =ksid;
    }
    function getKSID(){
        return KSID;
    }

});