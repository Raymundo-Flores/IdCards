import { Component, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-credencial-ferrari',
  templateUrl: './credencial-ferrari.html',
  styleUrls: ['./credencial-ferrari.css'],
  imports: [CommonModule, FormsModule]
})
export class CredencialFerrariComponent {

  constructor(private cdr: ChangeDetectorRef) { }

  nombre: string = '';
  fecha: string = '';
  fotoURL: string | ArrayBuffer | null = null;

  /* ------------------------------
        VARIABLES PARA CÁMARA
  ------------------------------ */
  @ViewChild('video', { static: false }) videoRef!: ElementRef<HTMLVideoElement>;
  mostrarCamara: boolean = false;
  stream: MediaStream | null = null;

  iniciarCamara() {
    this.mostrarCamara = true;

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.stream = stream;
        const video = this.videoRef.nativeElement;
        video.srcObject = stream;
        video.play();
      })
      .catch(error => {
        console.error("Error al iniciar la cámara", error);
        this.mostrarCamara = false;
      });
  }

  capturarFoto() {
    if (!this.videoRef) return;

    const video = this.videoRef.nativeElement;
    const canvas = document.createElement('canvas');

    canvas.width = 450;  // proporción similar a tu foto-socio (45mm x 61mm)
    canvas.height = 610;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    this.fotoURL = canvas.toDataURL('image/png');

    this.cerrarCamara();
  }

  cerrarCamara() {
    this.mostrarCamara = false;

    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }


  /* -------------------------
      SUBIR FOTO DESDE ARCHIVO
  -------------------------- */
  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.fotoURL = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }



  /* -------------------------
        GENERAR PDF (NO TOCADO)
  -------------------------- */
  async generarPDF() {

    const frontalOriginal = document.querySelector('#cardFrontal .card') as HTMLElement;
    const traseraOriginal = document.querySelector('#cardTrasera .card') as HTMLElement;

    const capture = document.getElementById('capture-area') as HTMLElement;

    // Medidas EXACTAS del PDF (px)
    const WIDTH_PX = 400;
    const HEIGHT_PX = 582;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [106, 154]   // 10.6 × 15.4 cm
    });

    // 1. CAPTURAR FRONTAL
    capture.innerHTML = "";
    const cloneFront = frontalOriginal.cloneNode(true) as HTMLElement;
    cloneFront.classList.add("capture-card");
    cloneFront.style.width = WIDTH_PX + "px";
    cloneFront.style.height = HEIGHT_PX + "px";

    capture.appendChild(cloneFront);

    await new Promise(r => setTimeout(r, 100));

    const canvasFront = await html2canvas(cloneFront, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      allowTaint: true,
    });

    const frontImg = canvasFront.toDataURL("image/png");

    pdf.addImage(frontImg, "PNG", 0, 0, 106, 154);

    // 2. CAPTURAR TRASERA
    pdf.addPage();
    capture.innerHTML = "";
const cloneBack = traseraOriginal.cloneNode(true) as HTMLElement;

  cloneBack.style.width = "400px";
  cloneBack.style.height = "582px";

  // 🔥 ESTA ES LA ROTACIÓN QUE html2canvas SÍ RENDERIZA
  cloneBack.style.transform = "rotate(180deg)";
  cloneBack.style.transformOrigin = "center center";
  cloneBack.style.display = "flex";
  cloneBack.style.alignItems = "center";
  cloneBack.style.justifyContent = "center";

  capture.appendChild(cloneBack);

  await new Promise(r => setTimeout(r, 80));

  const canvasBack = await html2canvas(cloneBack, {
    scale: 3,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  pdf.addImage(canvasBack, "PNG", 0, 0, 106, 154);
 
    pdf.save("credencial.pdf");
  }



  limpiarCampos(): void {
    this.nombre = '';
    this.fecha = '';
    this.fotoURL = null;

    const inputFoto = document.getElementById('foto') as HTMLInputElement;
    if (inputFoto) {
      inputFoto.value = '';
    }
  }
}
