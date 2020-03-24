$(document).ready(function() {
    var APIKey = "19a65d2ce55cea2e889329641e7616c9";
    var tracker = parseInt(localStorage.getItem("tracker"));
    var marker = findMarker();

    console.log(marker);
    
    checkStorage();
    loadSaved();
    locationFind();

    // Function to find the current location.
    function locationFind() {
        navigator.geolocation.getCurrentPosition(function(position) {
            lon = position.coords.longitude;
            lat = position.coords.latitude;

            var queryURLW = "https://api.openweathermap.org/data/2.5/weather?lat="+lat+"&lon="+lon+"&units=metric&appid="+APIKey;
            var queryURLF = "https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+lon+"&units=metric&appid="+APIKey;

            requests(queryURLW, queryURLF);
        },
        function() {
            if (localStorage.getItem("tracker") === null) {
                city = "adelaide";
            } else {
                city = localStorage.getItem(tracker - 1);
            }

            var queryURLW = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=metric&appid="+APIKey;
            var queryURLF = "https://api.openweathermap.org/data/2.5/forecast?q="+city+"&units=metric&appid="+APIKey;
            
            requests(queryURLW, queryURLF);
        })
    }

    // Function to load the current city on page opening.
    function requests(queryURLW, queryURLF) {
        $.ajax({
            url: queryURLW,
            METHOR: "GET"
        }).done(function(response) {
            console.log(response);
            currentWeather(response);

            var long = response.coords.lon;
            var lati = response.coords.lat;

            $.ajax({
                url: "https://api.openweathermap.org/data/2.5/uvi/forecast?appid="+APIKey+"&lat="+lati+"&lon="+long+"&cnt=2",
                METHOD: "GET"
            }).done(function(response) {
                console.log(response);
                uvDisplay(response);

                $.ajax({
                    url: queryURLF,
                    METHOD: "GET"
                }).done(function(response) {
                    console.log(response);
                    displayWeather(response);
                    ajaxPassed(response.city.name);
                }).fail(function() {
                    alert("Ajax request failed, city does not exist or check the spelling!");
                    return;
                });
            // Adding functions to check if the ajax failed.
            }).fail(function() {
                alert("Ajax request failed, city does not exist or check the spelling!");
                return;
            });
        }).fail(function() {
            alert("Ajax request failed, city does not exist or check the spelling!");
            return;
        });
    }

    // Function to search the cities.
    function citySearch(city) {
        $(".cityName").empty();
        $(".cityDate").empty();
        $("#day0").html("");
        $("#day1").html("");
        $("#day2").html("");
        $("#day3").html("");
        $("#day4").html("");
        $("#day5").html("");

        var queryURLW = "https://api.openweathermap.org/data/2.5/weather?q="+city+"&units=metric&appid="+APIKey;
        var queryURLF = "https://api.openweathermap.org/data/2.5/forecast?q="+city+"&units=metric&appid="+APIKey;

        requests(queryURLW, queryURLF);
    }

    // Function to load any previous searches on document load.
    function loadSaved() {
        for (var x = 0; x < tracker; x++) {
            var city = localStorage.getItem(x);
            buttonCreation(x, city);
        }
    }

    // Function to set the Id of search buttons, to check if theres saved searches and to continue id naming from last saved.
    function checkStorage() {
        if (tracker) {
            marker = tracker;
        } else {
            marker = 0;
        }
    }

    // Function to display the uv index.
    function uvDisplay(response) {
        var uvIndex = $("<p>").text("UV index: ");
        var value = $("<p>").text(response[0].value);

        value.attr("class", "badge badge-danger");

        uvIndex.append(value);
        $("#day0").append(uvIndex);
    }

    //fFunction to display the current weather.
    function currentWeather(response) {
        var city = $("<h1>").text(response.name);
        var date = $("<h1>").text(moment().format('MMMM Do YYYY'));
        var day = $("#day0");

        $(".cityName").append(city);
        $(".cityDate").append(date);

        var dayName = $("<h3>").text(moment().format("dddd"));
        var temp = $("<p>").text("Temp: " + response.main.temp);
        var weather = $("<p>").text("Weather: " + response.weather[0].main);
        var description = $("<p>").text("Type: " + response.weather[0].description);
        var humidity = $("<p>").text("Humidity: " + response.main.humidity+"%");
        var windSpeed = $("<p>").text("Wind speed: " + response.wind.speed+"m/s");
        var weatherPic = $("<img>").attr("src", pictureSort(response.weather[0].main));

        dayName.attr("style", "color:black; text-align:center;");
        
        day.append(dayName);
        day.append(weatherPic);
        day.append(temp);
        day.append(humidity);
        day.append(windSpeed);
        day.append(weather);
        day.append(description);
    }

    // Function to display to 5 day forecast.
    function displayWeather(response) {
        i = timeRead(response);
        for (i, e = 1; i < 40; i + 8, e++) {

            var day = $("#day"+e);

            // Displaying the days and the conditions.
            var dayName = $("<h4>").text(daySort(e));
            var temp = $("<p>").text("Temp: "+maxTemp(i, response));
            var weather = $("<p>").text("Weather: "+response.list[i].weather[0].main);
            var humidity = $("<p>").text("Humidity: "+averageHum(i, response)+"%");
            var weatherPic = $("<img>").attr("src", pictureSort(response.list[i].weather[0].main));

            dayName.attr("style", "color:black; text-align:center;");

            day.append(dayName);
            day.append(weatherPic);
            day.append(temp);
            day.append(humidity);
            day.append(weather);  

            i = i + 8;
        }
    }

    // Function allowing for time chnages to the 3hr blocks time stamp (updates).
    function timeRead(response) {
        var time = response.list[0]["dt_txt"];
        var hour = time.charAt(12)+time.charAt(13);

        return (24-parseInt(hour))/3;
    }
    
    // Function to display the maximum temperature.
    function maxTemp(i, response) {
        var maxT = [];
        for(x=0, z=i; x<8; z++, x++) {
            if(response.list[z]) {
                maxT.push(response.list[z].main.temp);
            }
        }

        return Math.max(...maxT);
    }

    // Function to find the average humidity.
    function averageHum(i, response) {
        var avgH = [];
        for (x = 0, z = i; x < 8; z++, x++) {
            if (response.list[z]) {
                avgH.push(response.list[z].main.humidity);
            }
        }

        var total = 0;

        for (x = 0; x < avgH.length; x++){
            total += avgH[x];
        }

        return Math.floor(total/avgH.length);
    }

    // Function to display the current days.
    function daySort(param){
        var weekArray = [];
        for (var d = 0; d < 7; d++) {
            weekArray.push(moment(new Date()).add(d, "day").format("dddd"));
        }
        return weekArray[param];
    }

    // Function to sort out which weather related picture to display.
    function pictureSort(weather){
        if (weather==="Clear") {
            return "assets/images/sunny.png"
        } else if (weather==="Storms") {
            return "assets/images/stormy.png"
        } else if (weather==="Rain") {
            return "assets/images/rainy.png"
        } else if (weather==="Windy") {
            return "assets/images/windy.png"
        } else if (weather==="Snow") {
            return "assets/images/snowy.png"
        } else {
            return "assets/images/cloudy.png"
        }
    }

    // Function to create past search buttons.
    function buttonCreation(marker, city) {
        var button = $("<button>").val(city);
        button.text(city);
        button.addClass("btn btn-info");
        button.attr("id", marker);
        button.attr("style", "margin-top:5px; width:100%;");
        $(".pastSearches").append(button);
    }

    // Function to detect if ajax has passed and if so to create buttons (checks if citeis are real).
    function ajaxPassed(city) {
        var alreadyButtons = [];

        for (var x = 0; x < marker; x++) {
            alreadyButtons.push($("#"+x).val());
        }
        
        if (!alreadyButtons.includes(city)) {
            buttonCreation(marker, city);
            localStorage.setItem(marker, city);   
            marker = marker + 1;
            localStorage.setItem("tracker", marker);
        }
    }

    // Function to set marker and see if there is a saved value.
    function findMarker() {
        if(localStorage.getItem("tracker") === null) {
            return 0; 
        } else {
            return tracker;
        }
    }

    // Listner for the search button.
    $("#searchBtn").on("click", function(){
        event.preventDefault();
        var city = $("#search").val().trim();
        
        if(city) {
            citySearch(city);
        }
    });

    // Listener to decide which past search was clicked.
    $(".pastSearches").on("click", function(event){
        event.preventDefault();
        var city = event.target.value;
        citySearch(city);
    });

    // Listener to clear the past searches.
    $(".clearButton").on("click", function(){
        if(confirm("This will delete all previous search history")) {
            localStorage.clear();
            location.reload();
        }
    });
});