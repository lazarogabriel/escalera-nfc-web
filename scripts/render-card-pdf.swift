// Pasa el arte del PDF del proveedor a PNG de 2400 px (solo macOS, usa PDFKit).
// Uso: swift scripts/render-card-pdf.swift "src/assets/card/12x12 google.pdf" src/assets/card
// Página 1 = tarjeta negra, página 3 = tarjeta blanca (las 2 y 4, con marco, se descartaron).

import PDFKit
import AppKit
let args = CommandLine.arguments
let doc = PDFDocument(url: URL(fileURLWithPath: args[1]))!
let size = 2400.0
for (index, name) in [(0, "negro"), (2, "blanco")] {
  let page = doc.page(at: index)!
  let box = page.bounds(for: .trimBox)
  let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size), pixelsHigh: Int(size), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
  let ctx = NSGraphicsContext(bitmapImageRep: rep)!
  let cg = ctx.cgContext
  cg.setFillColor(NSColor.white.cgColor)
  cg.fill(CGRect(x: 0, y: 0, width: size, height: size))
  cg.interpolationQuality = .high
  cg.scaleBy(x: size / box.width, y: size / box.height)
  cg.translateBy(x: -box.minX, y: -box.minY)
  page.draw(with: .trimBox, to: cg)
  let png = rep.representation(using: .png, properties: [:])!
  try! png.write(to: URL(fileURLWithPath: "\(args[2])/front-\(name).png"))
}
