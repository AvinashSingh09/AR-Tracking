export const tracking = {
  sdk: {
    filterMinCF: .001,
    filterBeta: 10,
    warmupTolerance: 2,
    missTolerance: 2,
  },
  smoothing: {
    // Less translation lag against the live camera; allow a wider rotation-noise
    // band before engaging fast catch-up. Target matching must succeed first.
    stationaryHalfLife: .035,
    movingHalfLife: .012,
    translationResponse: .08,
    rotationResponse: .35,
  },
};
