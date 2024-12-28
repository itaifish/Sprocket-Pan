use std::{fs::{self, File}, io::Error, sync::{Arc, Mutex}};

use serde::Deserialize;
use rayon::prelude::*;

#[derive(Deserialize)]
pub struct FileData {
	path: String,
	contents: String
}

#[tauri::command]
pub async fn save_files(data: Vec<FileData>) -> bool {
	let errors = Arc::new(Mutex::new(Vec::new()));
    let _res: Vec<_> = data
		.par_iter()
		.enumerate()
		.map(|(_, file_data)| {
			fs::write(&file_data.path, &file_data.contents)
		})
		.filter_map(|r| 
			r.map_err(|e| 
				errors.lock().unwrap().push(e)).ok())
		.collect();
	let no_failures = errors.lock().unwrap().len() == 0;
	no_failures
}
