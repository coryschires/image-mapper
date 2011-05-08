class Image < ActiveRecord::Base

  has_attached_file :photo
  named_scope :outdated, :conditions => ["created_at < :outdated", { :outdated => 12.hours.ago } ]  
  
  def alt_attribute
    photo_file_name.remove_file_extension.human_readable
  end

  def id_attribute
    photo_file_name.remove_file_extension.downcase
  end

  def src_attribute
    photo.url
  end

end

class String
  
  def remove_file_extension
    self.chomp(self[/[.]+([a-z]{0,})\z/i])
  end
  
  def human_readable
    self.gsub(/_|-/, " ").titleize
  end  
 
end