import "leaflet"

declare module "leaflet" {
	namespace Control {
		const Geocoder: {
			nominatim: () => any
		}
	}
}
