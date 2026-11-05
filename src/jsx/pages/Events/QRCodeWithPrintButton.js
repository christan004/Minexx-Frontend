import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer } from 'lucide-react';
import logoImage from "../../../images/minexx-196-blue.png";
import approvedImage from "../../../images/stamp.svg";
import logheader from "../../../images/Minexx-white.png";

const QRCodeWithPrintButton = ({ value }) => {
    const [isHovered, setIsHovered] = useState(false);
    const qrRef = useRef(null);
    const [logoDataUrl, setLogoDataUrl] = useState('');
    const [approvedDataUrl, setApprovedDataUrl] = useState('');
    const [logHeaderDataUrl, setlogHeaderDataUrl] = useState('');

    useEffect(() => {
        const loadImage = (src, setDataUrl) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                setDataUrl(canvas.toDataURL('image/png'));
            };
            img.src = src;
        };

        loadImage(logoImage, setLogoDataUrl);
        loadImage(approvedImage, setApprovedDataUrl);
        loadImage(logheader, setlogHeaderDataUrl);
    }, []);

    const handlePrint = (e) => {
        e.stopPropagation();

        const svgElement = qrRef.current;
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement);
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print QR Code</title>
                        <style>
                            body {
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                font-family: Arial, sans-serif;
                                background-color: #f0f0f0;
                            }
                            .card {
                                background-color: #00B7FF;
                                width: 450px;
                                height: 670px;
                                padding: 120px;
                                border-radius: 15px;
                                color: white;
                                text-align: center;
                                position: relative;
                                padding-top: 60px;
                            }
                            .logo {
                                position: absolute;
                                top: 60px;
                                left: 48%;
                                transform: translateX(-50%);
                                width: 170px;
                                height: 170px;
                                background-color: #00B7FF;
                                border-radius: 50%;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                z-index: 1;
                            }
                            .logo img {
                                width: 170px;
                                height: 170px;
                            }
                            .qr-container {
                                background-color: white;
                                padding: 120px;
                                width: 280px;
                                height: 290px;
                                border-radius: 15px;
                                display: flex;
                                flex-direction: column;
                                margin-left: -50px;
                                margin-top: 60px;
                            }
                            .title {
                                font-size: 40px;
                                font-weight: bold;
                                margin-bottom: 25px;
                                color: #00B7FF;
                            }
                            .qr-code {
                                margin-bottom: 30px;
                                position: relative;
                                display: inline-block;
                                padding: 25px;
                            }
                            .qr-code svg {
                                width: 240px !important;
                                height: 240px !important;
                            }
                            .qr-code::before,
                            .qr-code::after,
                            .qr-code > ::before,
                            .qr-code > ::after {
                                content: '';
                                position: absolute;
                                width: 30px;
                                height: 30px;
                                border-color: #00B7FF;
                                border-style: solid;
                            }
                            .qr-code::before {
                                top: 0;
                                left: 0;
                                border-width: 6px 0 0 6px;
                            }
                            .qr-code::after {
                                top: 0;
                                right: 0;
                                border-width: 6px 6px 0 0;
                            }
                            .qr-code > ::before {
                                bottom: 0;
                                left: 0;
                                border-width: 0 0 6px 6px;
                            }
                            .qr-code > ::after {
                                bottom: 0;
                                right: 0;
                                border-width: 0 6px 6px 0;
                            }
                            .approved {
                                margin-top: -50px;
                                margin-left: -30px;
                            }
                            .approved img {
                                width: 490px;
                                height: auto;
                            }
                            @media print {
                                body {
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="card">
                            <div class="logo">
                                <img src="${logHeaderDataUrl}" alt="Minexx Logo">
                            </div>
                            <div class="qr-container">
                                <div class="title">MINEXX CLUB</div>
                                <div class="qr-code">
                                    ${svgData}
                                    <i></i>
                                </div>
                            </div>
                            <div class="approved">
                                <img src="${approvedDataUrl}" alt="Approved">
                            </div>
                        </div>
                        <script>
                            window.onload = () => {
                                window.print();
                                window.close();
                            };
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div 
            style={{ position: 'relative' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <QRCodeSVG
                value={value}
                size={180}
                bgColor={"#ffffff"}
                fgColor={"#31a7e4"}
                level={"M"}
                includeMargin={false}
                imageSettings={{
                    src: logoImage,
                    x: undefined,
                    y: undefined,
                    height: 20,
                    width: 24,
                    excavate: true,
                }}
                ref={qrRef}
            />
            {isHovered && (
                <button
                    onClick={handlePrint}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '8px',
                        cursor: 'pointer',
                    }}
                >
                    <Printer size={24} color="#00B7FF" />
                </button>
            )}
        </div>
    );
};

export default QRCodeWithPrintButton;
