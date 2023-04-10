function sendOKREventSlackFromGCal() {

  var totalEvents = 0;

  var WebhookURL = "https://hooks.slack.com/services/XXXXXX/XXXXM/XXXXXXX";
  var calendars = ['c_XXXXXXXXXXX@group.calendar.google.com', 'c_YYYYYYYYYYYYYY@group.calendar.google.com'];

  var quarterRef = ["this quarter", "the next quarter"];

  // Sets how far in the future to look for events in calendars
  var StartTime = new Date();
  var EndTime = new Date(StartTime.getTime() + 518400000); // // 6 days from now - time in millis

  for(var i = 0; i < calendars.length; i++) {

    var calendar = CalendarApp.getCalendarById(calendars[i]);
    var color = calendar.getColor();
    var events = calendar.getEvents(StartTime, EndTime);
    var EventTitles = [];

    totalEvents += events.length;

    for (var j= 0; j < events.length; j++) {
      var NextEvent = [];
      NextEvent.push(events[j].getTitle());
          
      var NextEventStartDate = [];
      NextEventStartDate.push(events[j].getStartTime());
          
      var NextEventEndDate = [];
      NextEventEndDate.push(events[j].getEndTime());

      var StartDate = new Date(NextEventStartDate).toLocaleDateString('en-us', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      var EndDate = new Date(NextEventEndDate).toLocaleDateString('en-us', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
          
      EventTitles.push("\n\n *" + NextEvent + "* \n" + StartDate + " to " + EndDate);
    }

    //Let's assemble the payload
    var payload = {
      "channel" : "my-okr-events", // <-- optional parameter, use if you want to override default channel
      "username" : "OKR Event Reminder", // <-- optional parameter, use if you want to override default "robot" name 
      "text" : 'There are *' + events.length + '* upcoming OKR suggested events related to *' + quarterRef[i] + '*:',
      "attachments": [
        {
          "color": color,
          "fields":[
            {
              "title": EventTitles, // The title may not contain markup and will be escaped for you
              "value": String(EventTitles), // Text value of the field. May contain standard message markup and must be escaped as normal and multi-line
              "short":false  // Optional flag indicating whether the `value` is short enough to be displayed side-by-side with other values
            }
          ]
        }
      ]
    };

    // Sends the payload it to slack
    if(events.length > 0) {
      sendToSlack_(WebhookURL, payload);
    }
  }

// Send one last message to provide references
var payload = {
    "channel" : "#my-okr-events", // <-- optional parameter, use if you want to override default channel
    "username" : "OKR Event Reminder", // <-- optional parameter, use if you want to override default "robot" name 
    "icon_emoji": ":information_source:", // <-- optional parameter, use if you want to override default icon, 
    "text" : '_Please visit <https://myurl.com.br|*this*> for more details about this or leave us a message here._'
};

// Sends the payload it to slack
  if(totalEvents > 0) {
    sendToSlack_(WebhookURL, payload);
  }
}


function sendToSlack_(WebhookURL,payload) {
   var options =  {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(payload)
  };

  return UrlFetchApp.fetch(WebhookURL, options);
}
