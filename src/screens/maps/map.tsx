import React, { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, LayersControl, useMap, useMapEvents } from "react-leaflet"
import { LatLngExpression } from "leaflet"
import "leaflet-control-geocoder"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png"
import iconUrl from "leaflet/dist/images/marker-icon.png"
import shadowUrl from "leaflet/dist/images/marker-shadow.png"

import "leaflet-routing-machine"
import "leaflet-control-geocoder"

// Fix default marker icons
L.Icon.Default.mergeOptions({
	iconRetinaUrl,
	iconUrl,
	shadowUrl
})

// Custom car icon
const carIcon = new L.Icon({
	iconUrl: "path_to_car_icon.png", // Use your car icon path
	iconSize: [32, 32], // Adjust size accordingly
	iconAnchor: [16, 32],
	popupAnchor: [0, -32]
})

const { BaseLayer } = LayersControl

// Component to locate and route with moving car
const RoutingMachine: React.FC = () => {
	const map = useMap()
	const routingControlRef = useRef<L.Routing.Control | null>(null)
	const [carMarker, setCarMarker] = useState<L.Marker | null>(null)

	useEffect(() => {
		if (!map) return

		map.locate({ setView: true, maxZoom: 16 })

		map.on("locationfound", function (e: L.LocationEvent) {
			const userLatLng = e.latlng

			// Define dummy coordinates for the destination
			const destination: L.LatLng = new L.LatLng(51.51, -0.1) // Convert to L.LatLng

			// Remove the previous routing control if any
			if (routingControlRef.current) {
				map.removeControl(routingControlRef.current)
			}

			// Create routing control
			routingControlRef.current = L.Routing.control({
				waypoints: [userLatLng, destination],
				routeWhileDragging: true,
				geocoder: L.Control.Geocoder.nominatim(),
				show: true
			}).addTo(map)

			// Add car marker at start location
			const car = L.marker(userLatLng, { icon: carIcon }).addTo(map)
			setCarMarker(car)

			// Listen for routes found and animate the car
			routingControlRef.current.on("routesfound", function (e) {
				const routeCoordinates = e.routes[0].getLatLngs() // Get the route coordinates

				let i = 0
				const carMove = () => {
					if (i < routeCoordinates.length) {
						car.setLatLng(routeCoordinates[i]) // Move the car to the next coordinate
						i++
						setTimeout(carMove, 100) // Adjust speed of the animation here
					}
				}

				carMove()
			})
		})
	}, [map])

	return null
}

// Optional: Let user click to add destination
const AddDestinationOnClick: React.FC = () => {
	const map = useMapEvents({
		click(e) {
			const dest = e.latlng
			L.marker(dest).addTo(map).bindPopup("New Destination").openPopup()
		}
	})
	return null
}

const defaultPosition: LatLngExpression = [51.505, -0.09]

const MapView: React.FC = () => {
	return (
		<MapContainer center={defaultPosition} zoom={13} style={{ height: "100vh", width: "100%" }}>
			<LayersControl position='topright'>
				<BaseLayer checked name='OpenStreetMap'>
					<TileLayer
						attribution='&copy; OpenStreetMap contributors'
						url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
					/>
				</BaseLayer>

				<BaseLayer name='Esri Satellite'>
					<TileLayer
						attribution='Tiles &copy; Esri'
						url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
					/>
				</BaseLayer>

				<BaseLayer name='Dark Mode'>
					<TileLayer
						attribution='© OpenStreetMap, © CartoDB'
						url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
					/>
				</BaseLayer>
			</LayersControl>

			<RoutingMachine />
			<AddDestinationOnClick />
		</MapContainer>
	)
}

export default MapView
