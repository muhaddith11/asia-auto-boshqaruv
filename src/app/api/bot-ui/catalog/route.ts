import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    brands: ['Chevrolet', 'Hyundai', 'Kia', 'BYD', 'Lada', 'Daewoo', 'Toyota', 'Mersedes', 'BMW', 'Boshqa'],
    catalog: {
      'Chevrolet': {
        'Cobalt': [], 'Gentra': [], 'Nexia 3': [], 'Spark': [], 'Tracker': [], 'Malibu': [], 'Equinox': [], 'Traverse': [], 'Tahoe': []
      },
      'Hyundai': {
        'Elantra': [], 'Sonata': [], 'Tucson': [], 'Santa Fe': [], 'Palisade': []
      },
      'Kia': {
        'K5': [], 'Sorento': [], 'Sportage': [], 'Carnival': [], 'Seltos': []
      },
      'BYD': {
        'Song Plus': [], 'Han': [], 'Chazor': []
      }
    }
  };
  
  return NextResponse.json(data);
}
