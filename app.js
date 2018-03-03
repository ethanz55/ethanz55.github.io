const zomatoEndpoint = 'https://developers.zomato.com/api/v2.1/geocode';
const restaurantEndpoint = 'https://developers.zomato.com/api/v2.1/restaurant?res_id='
// zomato required partenership in order to access images so I had to use random pictures
// also would have added a phone number if zomato had it available to the public
const imgArray = [
  'https://i.imgur.com/kpu7hRD.jpg', 
  'http://www.2chai.com/wp-content/uploads/2018/01/coffee.jpg',
  'https://foodling8.files.wordpress.com/2010/04/img_1222.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/InNOut.svg/1200px-InNOut.svg.png',
  'http://2.bp.blogspot.com/-ec1MDR2TgEk/T2ncOAe4BrI/AAAAAAAATm4/r78P18Kz2Y8/s1600/IMG_4908.JPG',
  'https://cdn.vox-cdn.com/thumbor/6XLjizomXy5Cj1f4hL5icKMv_sk=/0x0:2400x1800/1200x900/filters:focal(0x0:2400x1800)/cdn.vox-cdn.com/uploads/chorus_image/image/49874943/shutterstock_193919228.0.0.jpg',
  'https://www.seriouseats.com/recipes/images/2015/05/Anova-Steak-Guide-Sous-Vide-Photos15-beauty-1500x1125.jpg',
  'https://www.thecheesecakefactory.com/assets/images/Menu-Import/CCF_FreshStrawberryCheesecake.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/2007feb-sushi-odaiba-manytypes.jpg/1200px-2007feb-sushi-odaiba-manytypes.jpg'
];



function getDataFromApi(searchTerm) {
  const query = {
    lat: searchTerm.coords.latitude,
    lon: searchTerm.coords.longitude
  }

  return fetch(zomatoEndpoint + '?lat=' + query.lat + '&lon=' + query.lon, { headers: {'user-key': '79f6bb0db344b1df724ab923597bc410'} })
    .then(res => res.json())
    .then(data => Promise.all(data.nearby_restaurants.map(res => 
      fetch(restaurantEndpoint + res.restaurant.id, { headers: {'user-key': '79f6bb0db344b1df724ab923597bc410'} }))))
    .then(responses => Promise.all(responses.map(res => res.json())));
}

function displayZomatoResults(data) {
  const display = data.map((item,index) => {
    let average_cost = item.average_cost_for_two;
    let displayAverage;

    if (average_cost == 0) {
      displayAverage = `<span class="nA">No Info Available</span>`;
    }
    else {
      displayAverage = `Average Cost For Two: &#36; ${average_cost}`;
    }

    let numberVotes = item.user_rating.votes;
    let displayVotes;
    if (numberVotes == 0) {
      displayVotes = `<span class="nA">No Info Available<span>`;
    }
    else {
      displayVotes = `${item.user_rating.aggregate_rating}/5 stars &#8226; ${numberVotes} votes`;
    }
    let streetAddress = item.location.address.split(",");

    return `
        <section class="resultsContainer">
          <img onload="spinnerStop()" src="${imgArray[index]}" class="thumbnailSize" alt="picture of the restaurant">
          <ul>
            <li class="no-list">
              <h2><a href="${item.url}" target="_blank">${item.name}</a></h2>
            </li>
            <li>${item.cuisines}</li>
            <li>${displayVotes}</li>
            <li>${streetAddress[0]}</li>
            <li>${item.location.city} ${item.location.zipcode}</li>
            <!--Zomato doesn't have phone number, requires partnership
            <li>(212) 228-2930</li>
            -->
            <li>${displayAverage}</li>
          </ul>
        </section>
    `;
  });
  console.log(data);
  
  $('main').html(display);
}

function spinnerStop() {
  $('aside').addClass('displayed');
  let snd2 = new Audio("finishLoad.mp3");
  snd2.play();
}

function addClasses() {
  $('header').addClass('clickHeader');
  $('.js-button').addClass('clickButton');
  $('.slogan').css('display', 'block');
  $('.titleLink').css('cursor', 'pointer');
  $('aside').removeClass('displayed');
}

function eventListeners() {
  $('.js-button').on('click', function(event) {
    let snd = new Audio("buttonPress.mp3");
    snd.play();
    addClasses();
    geo = navigator.geolocation.getCurrentPosition(coords => getDataFromApi(coords).then(displayZomatoResults));

  });
    $('.titleLink').on('click', function(event){
    location.reload();
  });
}

$(eventListeners);