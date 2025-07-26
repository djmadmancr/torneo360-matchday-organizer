-- Create storage bucket for team logos
INSERT INTO storage.buckets (id, name, public) VALUES ('team-logos', 'team-logos', true);

-- Create policies for team logo uploads
CREATE POLICY "Team logos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'team-logos');

CREATE POLICY "Users can upload their team logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'team-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their team logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'team-logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their team logos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'team-logos' AND auth.uid() IS NOT NULL);