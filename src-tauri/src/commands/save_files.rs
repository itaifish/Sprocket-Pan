use std::fs::{self};
use serde::Deserialize;
use rayon::iter::{IndexedParallelIterator, IntoParallelRefIterator, ParallelIterator};

#[derive(Deserialize)]
pub struct FileData {
	path: String,
	contents: String
}

#[tauri::command]
pub async fn save_files(data: Vec<FileData>) -> bool {
	let mut errors = Vec::new();
	data
		.par_iter()
		.enumerate()
		.map(|(_, file_data)| {
			fs::write(&file_data.path, &file_data.contents)
		})
		.collect_into_vec(&mut errors);
	let no_failures = errors.len() == 0;
	no_failures
}
