use tauri::{Manager, Window};

#[tauri::command]
pub fn zoom(window: Window, amount: f64) -> bool {
    let res: Result<(), tauri::Error> = window
        .get_window("main")
        .expect("no window labeled 'main' found")
        .with_webview(move |webview| {
            #[cfg(target_os = "linux")]
            {
                // see https://docs.rs/webkit2gtk/0.18.2/webkit2gtk/struct.WebView.html
                // and https://docs.rs/webkit2gtk/0.18.2/webkit2gtk/trait.WebViewExt.html
                use webkit2gtk::traits::WebViewExt;
                webview.inner().set_zoom_level(amount);
            }

            #[cfg(windows)]
            unsafe {
                // see https://docs.rs/webview2-com/0.19.1/webview2_com/Microsoft/Web/WebView2/Win32/struct.ICoreWebView2Controller.html
                webview.controller().SetZoomFactor(amount).unwrap();
            }

            #[cfg(target_os = "macos")]
            unsafe {
                use objc::{msg_send, sel, sel_impl};
                let _: () = msg_send![webview.inner(), setPageZoom: amount];
            }
        });
    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}
