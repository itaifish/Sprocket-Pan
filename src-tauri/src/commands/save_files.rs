use std::{fs::write, io::Error};
use serde::{Deserialize, Serialize};
use rayon::iter::{IndexedParallelIterator, IntoParallelRefIterator, ParallelIterator};
use tauri::async_runtime::spawn_blocking;

#[derive(Deserialize)]
pub struct FileData {
	path: String,
	content: String
}

#[derive(Serialize)]
pub struct FileWriteError {
	path: String,
	error: String
}

#[tauri::command]
pub async fn save_files(data: Vec<FileData>) -> Vec<FileWriteError> {
	let results = spawn_blocking(move || { 
			let res: Vec<(Result<(), Error>, String)> = data
				.par_iter()
				.enumerate()
				.map(|(_, file_data)| {
					(write(&file_data.path, &file_data.content), file_data.path.clone())
				})
				.collect();
			res
		}
	).await.unwrap();

	let failures: Vec<FileWriteError> = results
		.iter()
		.filter(|res| res.0.is_err())
		.map(|error_res| (error_res.0.as_ref().err().unwrap(), error_res.1.clone()))
		.map(|error| FileWriteError { error: format!("{}", error.0.kind()), path: error.1 })
		.collect();
	failures
}