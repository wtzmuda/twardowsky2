clear all
close all
% constants
g = 9.81; %m/s^2
elevation = 0.3; %[rad] elevation at the moment of the highest loads (used for transforming gravity load vector from earth css to body fixed css)
ndiv = 1000; % number of divisions of the length of the rocket

% module beginning x coordinates (with respect to the base of the rocket) unit: [m]

X.nose = 3530e-3;
X.canfins = 170e-3;
X.redu = 0e-3;
X.tube = 400e-3;


% module lenghts, unit: [m]

L.nose = 800e-3;
L.canfins = 230e-3;
L.redu = 170e-3;
L.tube = 3130e-3;
L.whole = L.nose + L.canfins + L.redu + L.tube;

% module actual dry masses, unit: [kg]

M.nose = 6.5;
M.canfins = 5+2.4;
M.redu = 1+1.77;
M.tube = 19-1.77-2.4 + 11.5 + 2 + 2;
M.whole = M.nose + M.canfins + M.redu + M.tube;

% module aerodynamic forces along X axis of body fixed coordinate system of
% the rocket [1,0,0] unit: [N]

Ax.nose = -860*2;
Ax.canfins = -333.5*2;
Ax.redu = -23.5*2;
Ax.tube = -570.8*2;
Ax.whole = Ax.nose + Ax.canfins + Ax.redu + Ax.tube;

% module aerodynamic forces along Y axis of body fixed coordinate system of
% the rocket [0,1,0] unit: [N]

Ay.nose = 801.6;
Ay.canfins = 1112;
Ay.redu = 143.2;
Ay.tube = 1146.8;
Ay.whole = Ay.nose + Ay.canfins + Ay.redu + Ay.tube;

%Thrust load in body fixed css
Thrust.F = 7094;%[N] 

%Thrust load application point (head of the motor)
Thrust.x = 900e-3; %[m] to be reviewed
%Thrust load distribution span (to avoid numerical error)
Thrust.span = 50e-3; %[m]

% calculating force, mass distribution along x axis of rocket

Force = zeros(ndiv,2); % N/m
Mass = zeros(ndiv,1); % kg/m

%indexes of beginnings of the modules
index.redu = 1;
index.canfins = floor(ndiv.*X.canfins./L.whole);
index.tube = floor(ndiv.*X.tube./L.whole);
index.nose = floor(ndiv.*X.nose./L.whole);

%mass per length vector
%reduction
Mass(1:index.canfins,1) = M.redu./(L.redu);
%fincan
Mass(index.canfins:index.tube,1) = M.canfins./(L.canfins);
%tube
Mass(index.tube:index.nose,1) = M.tube./(L.tube);
%nosecone
Mass(index.nose:floor(ndiv),1) = M.nose./(L.nose);

%total force and acceleration
Ftotal = [Ax.whole + Thrust.F ; Ay.whole];
atotal = Ftotal./M.whole;

%inertial force distribution F(x) = a*dm(x)

Force_i(:,1) = -atotal(1).*Mass;
Force_i(:,2) = -atotal(2).*Mass;



%reduction
Force(1:index.canfins,1) = Ax.redu/L.redu + Force_i(1:index.canfins,1);
Force(1:index.canfins,2) = Ay.redu/L.redu + Force_i(1:index.canfins,2);
%fincan + fins
Force(index.canfins:index.tube,1) = Ax.canfins/L.canfins + Force_i(index.canfins:index.tube,1);
Force(index.canfins:index.tube,2) = Ay.canfins/L.canfins + Force_i(index.canfins:index.tube,2);
%tube
Force(index.tube:index.nose,1) = Ax.tube/L.tube + Force_i(index.tube:index.nose,1);
Force(index.tube:index.nose,2) = Ay.tube/L.tube + Force_i(index.tube:index.nose,2);
%nosecone
Force(index.nose:floor(ndiv),1) = Ax.nose/L.nose + Force_i(index.nose:floor(ndiv),1);
Force(index.nose:floor(ndiv),2) = Ay.nose/L.nose + Force_i(index.nose:floor(ndiv),2);

%adding thrust to force vector

Force(floor(ndiv.*(Thrust.x-0.5*Thrust.span)./L.whole):floor(ndiv.*(Thrust.x+0.5*Thrust.span)./L.whole),1) = Force(floor(ndiv.*(Thrust.x-0.5*Thrust.span)./L.whole):floor(ndiv.*(Thrust.x+0.5*Thrust.span)./L.whole),1) + Thrust.F./Thrust.span;

figure
plot(linspace(0,L.whole,ndiv),Force(:,1))
hold on
plot(linspace(0,L.whole,ndiv),Force(:,2))
ylabel("force per length [N/m]")
xlabel("length along rocket [m]")
xticks([X.redu X.canfins X.tube X.nose L.whole]);
xticklabels({'reduction','fincan','tube','nose','end'})
legend("X axis","Y axis")
grid on
title("Force per length distribution")

figure
plot(linspace(0,L.whole,ndiv),Mass)
grid on
ylabel("mass per length [kg/m]")
xlabel("length along rocket [m]")
xticks([X.redu X.canfins X.tube X.nose L.whole]);
xticklabels({'reduction','fincan','tube','nose','end'})
title("mass per length distribution")

%calculating residuals (the closer they are to 0 the better)
Residual.X_force = trapz(linspace(0,L.whole,ndiv),Force(:,1));
Residual.Y_force = trapz(linspace(0,L.whole,ndiv),Force(:,2));
Residual.inertial = Ftotal + [trapz(linspace(0,L.whole,ndiv),Force_i(:,1)) trapz(linspace(0,L.whole,ndiv),Force_i(:,2))]';
Residual.Mass = trapz(linspace(0,L.whole,ndiv),Mass) - M.whole;



%integrating the forces to get normal force, shear force and bending moment
%as function of x

% normal force

Fx = griddedInterpolant(linspace(0,L.whole,ndiv),Force(:,1),"linear");
Fy = griddedInterpolant(linspace(0,L.whole,ndiv),Force(:,2),"linear");

Force_x = @(x) Fx(x);
Force_y = @(y) Fy(y);
Moment = @(x,s) Force_y(s).*(s-x);

for i = 1:ndiv
    l = (i/ndiv)*L.whole;
N(i) = -integral(Force_x,0,l);
T(i) = integral(Force_y,0,l);
Mg(i) = -integral(@(s) Moment(l,s),l,L.whole);
end

figure
plot(linspace(0,L.whole,ndiv),T);
hold on
plot(linspace(0,L.whole,ndiv),N);
legend("Shear Force (T)","Normal Force (N)")
grid on
xlabel("Length along rocket [m]")
ylabel("Force [N]")
title("Shear and normal force along length")

figure
plot(linspace(0,L.whole,ndiv),Mg);
grid on
xlabel("Length along rocket [m]")
ylabel("Bending Moment [Nm]")
title("Bending moment along length")










