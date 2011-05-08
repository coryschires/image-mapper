namespace :images do

  desc "Delete all images create more than 12hrs ago"
  task :delete => :environment do

    begin
      outdated_images = Image.outdated
    
      if outdated_images.empty?
        puts"No images have been uploaded. Nothing to delete."
      else
        num_of_images = outdated_images.size
        outdated_images.delete_all
        puts "Success. #{num_of_images} images deleted."
      end
      
    rescue
      puts "There has been an error while deleting outdated images."
      puts "Please check '/lib/tasks/delete_images.rake' to ensure"
      puts "things are working properly."
    end
    
  end
  
end