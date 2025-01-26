// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, Window, generate_handler, generate_context};
use tauri_plugin_log::{LogTarget, RotationStrategy};

mod commands;

use commands::{close_splashscreen, save_files, show_in_explorer, zoom};

#[cfg(debug_assertions)]
fn open_devtools(window: &Window) {
    window.open_devtools();
}

#[cfg(not(debug_assertions))]
fn open_devtools(_window: &Window) {}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            // only include this code on debug builds
            if cfg!(debug_assertions) {
                open_devtools(&window);
            }
            window.hide().unwrap();
            Ok(())
        })
        .plugin(
            tauri_plugin_log::Builder::default()
                .rotation_strategy(RotationStrategy::KeepAll)
                .max_file_size(10_000)
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .invoke_handler(generate_handler![
            close_splashscreen,
            zoom,
            show_in_explorer,
            save_files
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}
