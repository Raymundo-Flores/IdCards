import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credencial-ferrari',
  templateUrl: './credencial-ferrari.html',
  styleUrls: ['./credencial-ferrari.css'],
  imports :[
    CommonModule,
    FormsModule
  ]
})
export class CredencialFerrariComponent {
  nombre: string = '';
  fecha: string = '';
  fotoURL: string | ArrayBuffer | null = null;

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

  onSubmit(): void {
    // Aquí puedes hacer algo cuando se "genere" la credencial,
    // por ejemplo guardarlo, enviarlo al servidor, etc.
    console.log('Credencial generada:', {
      nombre: this.nombre,
      fecha: this.fecha,
      fotoURL: this.fotoURL
    });
    // Puedes mostrar un mensaje o lo que necesites
    alert('Credencial generada correctamente 🏎️');
  }

  // 🧹 Método para limpiar todos los campos del formulario
  limpiarCampos(): void {
    this.nombre = '';
    this.fecha = '';
    this.fotoURL = null;

    // Limpiar el input file manualmente
    const inputFoto = document.getElementById('foto') as HTMLInputElement;
    if (inputFoto) {
      inputFoto.value = '';
    }
  }
}
