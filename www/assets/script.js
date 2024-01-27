document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  if (navigator.onLine) {
    changeOnlineState("on");
  } else {
    changeOnlineState("off");
  }
}

function clickListenStart() {
  tspSocket.grantPermission();

  document.getElementById("interVoiceText").innerText = "listening";
  document.getElementById("btn-play").hidden = true;
  document.getElementById("btn-pause").hidden = false;
}
function clickListenPause() {
  tspSocket.stopRecording();

  document.getElementById("interVoiceText").innerText = "";
  document.getElementById("btn-play").hidden = false;
  document.getElementById("btn-pause").hidden = true;
}

function changeOnlineState(state) {
  if (state == "on") {
    document.getElementById("online-dot").style.backgroundColor = "green";
    document.getElementById("online-dot-text").innerText = "Online";
  } else if (state == "off") {
    document.getElementById("online-dot").style.backgroundColor = "red";
    document.getElementById("online-dot-text").innerText = "Offline";
  }
}

var tspSocket = (function () {
  return {
    grantPermission: function () {
      grantPermissionF();
    },
    stopRecording: function () {
      stopRecordingF();
    },
  };
})(tspSocket || {});

var recognizing;

function reset() {
  recognizing = false;
  speech.start();
}

var speech = new webkitSpeechRecognition() || speechRecognition();
speech.continuous = false;
speech.interimResults = true;

function grantPermissionF() {
  try {
    speech.start();
  } catch (error) {
    reset();
  }
}

function stopRecordingF() {
  recognizing = false;
  speech.stop();
}

speech.onstart = function () {
  recognizing = true;
};

var words = [];

var oldLog = console.log;
console.log = function (message) {
  oldLog.apply(console, arguments);
  // Output the message to the textarea
  document.getElementById("console-log-textarea").value += message + "\n";
};

//Online/Offline state check browser
window.ononline = function () {
  changeOnlineState("on");
  if (
    localStorage.getItem("words") == null ||
    localStorage.getItem("words") == ""
  )
    return;
  var offlineWords = JSON.parse(localStorage.getItem("words"));
  saveWordsToDatabase(offlineWords);
  localStorage.removeItem("words");
};

window.onoffline = function () {
  changeOnlineState("off");
};
//Online/Offline state check device
document.addEventListener("online", function () {
  changeOnlineState("on");
  if (
    localStorage.getItem("words") == null ||
    localStorage.getItem("words") == ""
  )
    return;
  var offlineWords = JSON.parse(localStorage.getItem("words"));
  saveWordsToDatabase(offlineWords);
  localStorage.removeItem("words");
});

document.addEventListener("offline", function () {
  changeOnlineState("off");
});

function saveWordsToDatabase(words) {
  try {
    words.forEach((word) => {
      let formData = new FormData();
      formData.append("word", word);

      fetch("https://web009.wifiooe.at/stuff/spracheingabe/db.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => console.log(response.text()))
        .then((data) => console.log(data))
        .catch((error) => {
          console.error("Error:", error);
        });
    });
    console.log("Saved words to database");
  } catch (error) {
    console.error("Failed to save words to database: ", error);
  }
}

speech.onresult = function (event) {
  var interim_transcript = "";
  var final_transcript = "";

  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      final_transcript += event.results[i][0].transcript;
      if (final_transcript != "") {
        const data = JSON.stringify([
          {
            id: "1",
            language: "",
            text: final_transcript,
          },
        ]);

        if (navigator.onLine) {
          const xhr = new XMLHttpRequest();
          xhr.withCredentials = true;

          var languageMappings = {
            en: "English",
            es: "Spanish",
            fr: "French",
            de: "German",
            it: "Italian",
            pt: "Portuguese",
            nl: "Dutch",
            ru: "Russian",
            ja: "Japanese",
            zh: "Chinese",
            ar: "Arabic",
            hi: "Hindi",
            ko: "Korean",
            tr: "Turkish",
            pl: "Polish",
          };

          xhr.addEventListener("readystatechange", function () {
            if (this.readyState === this.DONE) {
              var jsonResponse = JSON.parse(this.responseText);

              var detectedLanguageCode = jsonResponse[0].detected_language;
              var detectedLanguageFullName =
                languageMappings[detectedLanguageCode];
              if (detectedLanguageFullName) {
                document.getElementById("languageDetectionResult").innerText =
                  detectedLanguageFullName;
              } else {
                document.getElementById("languageDetectionResult").innerText =
                  "Unknown Language";
              }
              console.log(this.response);
            }
          });

          xhr.open(
            "POST",
            "https://language-detection4.p.rapidapi.com/language-detection"
          );
          xhr.setRequestHeader("content-type", "application/json");
          xhr.setRequestHeader("Accept", "application/json");
          xhr.setRequestHeader(
            "X-RapidAPI-Key",
            "95681fc071mshcc5ff67d6afc545p1d2974jsnd9e6a716a629"
          );
          xhr.setRequestHeader(
            "X-RapidAPI-Host",
            "language-detection4.p.rapidapi.com"
          );

          xhr.send(data);
        }
      }

      document.getElementById("interVoiceText").innerText = "";

      if (document.getElementById("finalVoiceText").innerText.length >= 300) {
        document.getElementById("finalVoiceText").innerText =
          final_transcript + " ";
      } else {
        document.getElementById("finalVoiceText").innerText +=
          final_transcript + " ";
      }
    } else {
      interim_transcript += event.results[i][0].transcript;
      document.getElementById("interVoiceText").innerText = interim_transcript;
    }

    var e = final_transcript.split(" ");
    e.forEach((word) => {
      if (word == "") return;
      words.push(word);
    });

    if (navigator.onLine) {
      saveWordsToDatabase(words);
      words = [];
    } else {
      localStorage.setItem("words", JSON.stringify(words));
    }
  }
};

speech.onerror = function () {
  speech.stop();
};

speech.onend = function () {
  if (recognizing) {
    reset();
  }
};
