export const content = {
  title: '360 Bright Media',
  target: '/content/card-v1/target.mind',
  image: '/content/card-v1/target.jpg',
  video: '/content/card-v1/demo.mp4',
  poster: '/content/card-v1/poster.jpg',
  aspect: 960 / 570,
  videoAspect: 640 / 360,
};

// Seconds, fractions of target width, and radians. Kept outside the tracking loop
// so physical-device feedback can tune responsiveness without changing lifecycle code.
export const tracking = {
  smoothing: {
    stationaryHalfLife: 0.065,
    movingHalfLife: 0.012,
    translationResponse: 0.04,
    rotationResponse: 0.12,
  },
};
