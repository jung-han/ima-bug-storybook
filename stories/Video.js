var adsManager;
var adsLoader;
var adDisplayContainer;
var intervalTimer;
var playButton;
var videoContent;

export const video = () => {
  const container = document.createElement('div');

  videoContent = document.createElement('video');
  videoContent.style.width = '100%';
  videoContent.style.height = '100%';
  videoContent.src = 'https://www.w3schools.com/tags/movie.mp4';

  playButton = document.createElement('button');
  playButton.textContent = 'play';
  playButton.addEventListener('click', playAds);

  adDisplayContainer = document.createElement('div');
  

  container.append(videoContent, adDisplayContainer, playButton);

  setUpIMA();

  return container;
};

function setUpIMA() {
  createAdDisplayContainer();
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded, false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR, onAdError, false);

  var contentEndedListener = function() {
    adsLoader.contentComplete();
  };
  videoContent.onended = contentEndedListener;

  var adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
      'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
      'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
      'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

  adsRequest.linearAdSlotWidth = 640;
  adsRequest.linearAdSlotHeight = 400;

  adsRequest.nonLinearAdSlotWidth = 640;
  adsRequest.nonLinearAdSlotHeight = 150;

  adsLoader.requestAds(adsRequest);
}

function createAdDisplayContainer() {
  adDisplayContainer = new google.ima.AdDisplayContainer(
      document.getElementById('adContainer'), videoContent);
}

function playAds() {
  videoContent.load();
  adDisplayContainer.initialize();

  try {
    adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    videoContent.play();
  }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  var adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  adsManager =
      adsManagerLoadedEvent.getAdsManager(videoContent, adsRenderingSettings);

  adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED, onAdEvent);

  // Listen to any additional events, if necessary.
  adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, onAdEvent);
  adsManager.addEventListener(google.ima.AdEvent.Type.COMPLETE, onAdEvent);
}

function onAdEvent(adEvent) {
  var ad = adEvent.getAd();
  switch (adEvent.type) {
    case google.ima.AdEvent.Type.LOADED:
      if (!ad.isLinear()) {
        videoContent.play();
      }
      break;
    case google.ima.AdEvent.Type.STARTED:
      if (ad.isLinear()) {
        intervalTimer = setInterval(
            function() {
              var remainingTime = adsManager.getRemainingTime();
            },
            300);  // every 300ms
      }
      break;
    case google.ima.AdEvent.Type.COMPLETE:
      if (ad.isLinear()) {
        clearInterval(intervalTimer);
      }
      break;
  }
}

function onAdError(adErrorEvent) {
  console.log(adErrorEvent.getError());
  adsManager.destroy();
}

function onContentPauseRequested() {
  videoContent.pause();
}

function onContentResumeRequested() {
  videoContent.play();
}
