import { useEffect, useState } from 'react';
import { generateWidgetUrl } from '../config';

// Using QRCode.js via CDN - declare it for TypeScript
declare const QRCode: any;

interface QRCodeData {
  id: string;
  name: string;
}

const qrCodes: QRCodeData[] = [
  { id: 'player-1', name: 'Player 1' },
  { id: 'player-2', name: 'Player 2' },
  { id: 'player-3', name: 'Player 3' },
  { id: 'player-4', name: 'Player 4' },
  { id: 'player-5', name: 'Player 5' },
  { id: 'player-6', name: 'Player 6' },
];

function QRCodesPage() {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load QRCode.js library
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    script.async = true;
    script.onload = () => {
      // Generate QR codes after library loads
      qrCodes.forEach((qr) => {
        const element = document.getElementById(`qr-${qr.id}`);
        if (element && element.children.length === 0) {
          // Generate the full widget URL with all parameters
          const url = generateWidgetUrl(qr.id);
          new QRCode(element, {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H,
          });
        }
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const toggleCard = (id: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-white text-center mb-10 text-5xl font-bold drop-shadow-lg">
          🎥 Stream RADAR
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {qrCodes.map((qr) => {
            const isFlipped = flippedCards.has(qr.id);
            return (
              <div
                key={qr.id}
                className="h-[400px] cursor-pointer [perspective:1000px]"
                onClick={() => toggleCard(qr.id)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* Front of card */}
                  <div className="absolute w-full h-full [backface-visibility:hidden] bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8">
                    <h3 className="text-[#667eea] text-2xl font-semibold mb-4">
                      {qr.name}
                    </h3>
                    <p className="text-gray-500 text-sm italic">
                      Click to reveal QR code
                    </p>
                  </div>

                  {/* Back of card */}
                  <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8">
                    <h3 className="text-[#667eea] text-2xl font-semibold mb-5">
                      {qr.name}
                    </h3>
                    <div
                      id={`qr-${qr.id}`}
                      className="inline-block p-4 bg-white rounded-xl mb-4"
                    />
                    <div className="bg-gray-100 p-3 rounded-lg text-xs break-all max-w-full">
                      <strong className="text-gray-700 block mb-1">Widget URL:</strong>
                      <a
                        href={generateWidgetUrl(qr.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#667eea] hover:underline block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {generateWidgetUrl(qr.id)}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default QRCodesPage;
