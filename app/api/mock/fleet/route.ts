import { NextResponse } from 'next/server';

// Initial state for 10 mock vessels
let mockFleet = [
    { id: '1', name: 'EVER GIVEN', imo: '9811000', lat: 30.01, lng: 32.55, heading: 45, speed: 12.0, status: 'moving', nextPort: 'Rotterdam', eta: '2024-02-15 14:00', type: 'Cargo' },
    { id: '2', name: 'MAERSK ALABAMA', imo: '9164263', lat: 25.10, lng: -55.20, heading: 270, speed: 16.5, status: 'moving', nextPort: 'Charleston', eta: '2024-02-12 09:30', type: 'Cargo' },
    { id: '3', name: 'HMM ALGECIRAS', imo: '9863297', lat: 1.25, lng: 103.80, heading: 0, speed: 0, status: 'moored', nextPort: 'Singapore', eta: 'Arrived', type: 'Cargo' },
    { id: '4', name: 'CMA CGM MARCO POLO', imo: '9454436', lat: 45.45, lng: -73.35, heading: 92, speed: 0.5, status: 'anchored', nextPort: 'Montreal', eta: '2024-02-10 18:00', type: 'Cargo' },
    { id: '5', name: 'MSC GULSUN', imo: '9839430', lat: 35.89, lng: 14.51, heading: 120, speed: 18.2, status: 'moving', nextPort: 'Marsaxlokk', eta: '2024-02-28 08:00', type: 'Cargo' },
    { id: '6', name: 'OOCL HONG KONG', imo: '9776171', lat: 22.31, lng: 114.17, heading: 180, speed: 14.0, status: 'moving', nextPort: 'Hong Kong', eta: '2024-03-01 10:00', type: 'Cargo' },
    { id: '7', name: 'COSCO SHIPPING UNIVERSE', imo: '9795610', lat: 51.95, lng: 4.05, heading: 240, speed: 20.1, status: 'moving', nextPort: 'Rotterdam', eta: '2024-03-05 12:00', type: 'Cargo' },
    { id: '8', name: 'MOL TRIUMPH', imo: '9769271', lat: 34.69, lng: 135.50, heading: 90, speed: 0, status: 'moored', nextPort: 'Osaka', eta: 'Arrived', type: 'Cargo' },
    { id: '9', name: 'MADRID MAERSK', imo: '9778791', lat: 53.55, lng: 9.99, heading: 330, speed: 10.5, status: 'moving', nextPort: 'Hamburg', eta: '2024-03-10 16:00', type: 'Cargo' },
    { id: '10', name: 'ANTOINE DE SAINT EXUPERY', imo: '9770763', lat: 40.71, lng: -74.00, heading: 0, speed: 0, status: 'anchored', nextPort: 'New York', eta: '2024-03-15 09:00', type: 'Cargo' },
];

export async function GET() {
    // Simulate vessel movement on every fetch
    mockFleet = mockFleet.map(v => {
        if (v.status === 'moving') {
            const rad = v.heading * (Math.PI / 180);
            return {
                ...v,
                // Move based on heading and speed
                lat: v.lat + (v.speed * 0.001 * Math.cos(rad)),
                lng: v.lng + (v.speed * 0.001 * Math.sin(rad)),
                // Add tiny variations to speed and heading for realism
                speed: Math.max(0, Math.min(25, v.speed + (Math.random() - 0.5) * 0.5)),
                heading: (v.heading + (Math.random() - 0.5) * 2 + 360) % 360
            };
        }
        return v;
    });

    return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        count: mockFleet.length,
        vessels: mockFleet
    });
}

export async function POST(req: Request) {
    try {
        const newVessel = await req.json();
        mockFleet.push(newVessel);
        return NextResponse.json({ success: true, count: mockFleet.length });
    } catch (error) {
        console.error("Mock fleet POST error:", error);
        return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }
}
