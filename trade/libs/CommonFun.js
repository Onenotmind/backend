function cacl (long, lati, rate, direction, hungry, speed) {
  let tmpWidth = 0
  let tmpHeight = 0
  if (direction === 'east') {
    tmpWidth = rate * (hungry / 100)
    tmpHeight = rate * (speed / 100)
    lati = lati + 0.5 * tmpHeight > 90 ? 90 : lati + 0.5 * tmpHeight
  } else if (direction === 'west') {
    tmpWidth = rate * (hungry / 100)
    tmpHeight = rate * (speed / 100)
    lati = lati + 0.5 * tmpHeight > 90 ? 90 : lati + 0.5 * tmpHeight
    long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
  } else if (direction === 'north') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    long = long - tmpWidth* 0.5 < -180 ? 360 + long -tmpWidth* 0.5 : long - tmpWidth* 0.5
    lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
  } else if (direction === 'south') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    long = long - tmpWidth* 0.5 < -180 ? 360 + long -tmpWidth* 0.5 : long - tmpWidth* 0.5
  } else if (direction === 'northEast') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
  } else if (direction === 'northWest') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    lati = lati + tmpHeight > 90 ? 90 : lati + tmpHeight
    long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
  } else if (direction === 'southEast') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
  } else if (direction === 'southWest') {
    tmpWidth = rate * (speed / 100)
    tmpHeight = rate * (hungry / 100)
    long = long - tmpWidth < -180 ? 360 + long -tmpWidth : long - tmpWidth
  } else {}
  return {
    longitude: long,
    latitude: lati,
    width: tmpWidth,
    height: tmpHeight
  }
}

module.exports = {
	cacl: cacl
}