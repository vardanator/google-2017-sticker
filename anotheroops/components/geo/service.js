
const iplocation = require('iplocation');

class GeoService {

    static getLocationByIP(ip) {
        return new Promise((resolve, reject) => {
            if (!ip) return resolve(null);
            iplocation(ip).then(res => resolve({
                city: res.city,
                country: res.country,
                latitude: res.lat,
                longitude: res.lon,
                ip: res.ip
            })).catch(err => resolve(null)); // silencing error
        });
    }

}

module.exports = GeoService;
