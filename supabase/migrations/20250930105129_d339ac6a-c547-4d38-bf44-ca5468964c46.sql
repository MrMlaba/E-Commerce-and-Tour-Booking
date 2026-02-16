-- Assign admin role to the current logged-in user
INSERT INTO public.user_roles (user_id, role)
VALUES ('30624f17-7d24-482d-8644-caefe81c24b2', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;