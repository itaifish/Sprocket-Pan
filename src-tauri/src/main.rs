// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, Window};
use tauri_plugin_log::{LogTarget, RotationStrategy};

mod commands;

use commands::{close_splashscreen, show_in_explorer, zoom};

#[cfg(debug_assertions)]
fn open_devtools(window: &Window) {
    window.open_devtools();
}

#[cfg(not(debug_assertions))]
fn open_devtools(_window: &Window) {}

fn main() {
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
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            zoom,
            show_in_explorer
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
